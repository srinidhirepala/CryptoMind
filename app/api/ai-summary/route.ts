import { OpenAI } from 'openai';
import { NextRequest } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { walletData } = await request.json() as {
            walletData: {
                address: string;
                totalUsdValue: number;
                totalChange24h: number;
                chainName: string;
                tokens: Array<{
                    symbol: string;
                    name: string;
                    balance: string;
                    usdValue: number;
                    priceChange24h: number;
                }>;
            };
        };

        if (!walletData) {
            return new Response(JSON.stringify({ error: 'No wallet data provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Build a structured description of the wallet
        const topHolding = walletData.tokens.sort((a, b) => b.usdValue - a.usdValue)[0];
        const topPercent = walletData.totalUsdValue > 0
            ? ((topHolding?.usdValue ?? 0) / walletData.totalUsdValue * 100).toFixed(1)
            : '0';

        const portfolioDescription = walletData.tokens
            .filter((t) => t.usdValue > 0)
            .map(
                (t) =>
                    `${t.symbol}: ${parseFloat(t.balance).toFixed(4)} tokens worth $${t.usdValue.toFixed(2)} (${t.priceChange24h.toFixed(1)}% 24h change)`
            )
            .join(', ');

        const systemPrompt = `You are a friendly, knowledgeable crypto portfolio analyst. 
You explain things in plain English, avoiding jargon when possible.
Always be honest and objective. Do NOT give specific financial advice or tell users to buy/sell.
Keep your summary to exactly 3-4 sentences, conversational and insightful.`;

        const userPrompt = `Analyze this crypto wallet and provide a 3-4 sentence plain English summary:

Wallet: ${walletData.address?.slice(0, 10)}...
Network: ${walletData.chainName}
Total Portfolio Value: $${walletData.totalUsdValue.toFixed(2)}
24h Change: ${walletData.totalChange24h.toFixed(2)}%
Top Holding: ${topHolding?.symbol ?? 'N/A'} (${topPercent}% of portfolio)
Holdings: ${portfolioDescription || 'No token data available'}

Write a concise, plain-English summary covering: total value, top holdings, 24h performance, and one observation about portfolio composition. Be conversational and friendly.`;

        const stream = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            stream: true,
            max_tokens: 200,
            temperature: 0.7,
        });

        // Create a streaming response
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
                    console.error('Stream error:', error);
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
                'X-Content-Type-Options': 'nosniff',
            },
        });
    } catch (error) {
        console.error('[AI Summary] Error:', error);

        const message =
            error instanceof Error ? error.message : 'Internal server error';

        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
