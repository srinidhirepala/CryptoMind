import { OpenAI } from 'openai';
import { NextRequest } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface WalletContext {
    address: string | null;
    totalUsdValue: number;
    totalChange24h: number;
    chainName: string | null;
    tokens: Array<{
        symbol: string;
        name: string;
        balance: string;
        usdValue: number;
        priceChange24h: number;
    }>;
}

interface MessageInput {
    role: 'user' | 'assistant';
    content: string;
}

function buildSystemPrompt(walletCtx: WalletContext | null): string {
    const now = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    let systemPrompt = `You are CryptoMind AI, a friendly and knowledgeable crypto assistant. 
You explain cryptocurrency, DeFi, and blockchain concepts in plain English without using excessive jargon.
You are helpful, direct, and honest. Today is ${now}.

IMPORTANT RULES:
- Always add a disclaimer that you are NOT providing financial advice for investment decisions
- Be concise — keep responses under 3 paragraphs unless a detailed explanation is necessary
- Use emojis sparingly but effectively to make responses friendly
- When referencing specific coins, always use their common name AND ticker (e.g., "Ethereum (ETH)")
- If the user asks about something risky, always mention the risks clearly`;

    if (walletCtx) {
        const topHoldings = walletCtx.tokens
            .sort((a, b) => b.usdValue - a.usdValue)
            .slice(0, 5)
            .map(
                (t) =>
                    `${t.symbol}: ${parseFloat(t.balance).toFixed(4)} tokens = $${t.usdValue.toFixed(2)} USD (${t.priceChange24h >= 0 ? '+' : ''}${t.priceChange24h.toFixed(2)}% 24h)`
            )
            .join('\n  - ');

        systemPrompt += `

WALLET CONTEXT (for personalized responses):
- Address: ${walletCtx.address?.slice(0, 10)}... on ${walletCtx.chainName}
- Total Portfolio Value: $${walletCtx.totalUsdValue.toFixed(2)} USD
- 24h Change: ${walletCtx.totalChange24h >= 0 ? '+' : ''}${walletCtx.totalChange24h.toFixed(2)}%
- Holdings:
  - ${topHoldings || 'No token data'}

Use this wallet data to give personalized, relevant answers. When users ask "should I..." questions, reference their actual holdings.`;
    } else {
        systemPrompt += `\n\nNote: No wallet is currently connected. Give general crypto advice.`;
    }

    return systemPrompt;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as {
            messages: MessageInput[];
            walletContext: WalletContext | null;
        };

        const { messages, walletContext } = body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return new Response(JSON.stringify({ error: 'Messages array is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Validate messages
        const validatedMessages = messages
            .filter((m) => m.role && m.content && typeof m.content === 'string')
            .slice(-20); // Keep last 20 messages for context

        const systemPrompt = buildSystemPrompt(walletContext);

        const stream = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                ...validatedMessages,
            ],
            stream: true,
            max_tokens: 400,
            temperature: 0.7,
        });

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content ?? '';
                        if (content) {
                            controller.enqueue(encoder.encode(content));
                        }
                    }
                } catch (error) {
                    console.error('[Chat Stream] Error:', error);
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error) {
        console.error('[AI Chat] Error:', error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
