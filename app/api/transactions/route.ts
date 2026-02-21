import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { getTransactions, inferTransactionType } from '@/lib/etherscan';
import type { Transaction } from '@/types';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Uses GPT-4o-mini to generate a plain-English label for a transaction
 */
async function labelTransaction(
    tx: Transaction,
    walletAddress: string
): Promise<string> {
    const isOutgoing = tx.from.toLowerCase() === walletAddress.toLowerCase();
    const ethValue = (Number(tx.value) / 1e18).toFixed(6).replace(/\.?0+$/, '') || '0';
    const hasInput = tx.input && tx.input !== '0x' && tx.input.length > 2;

    const prompt = `Describe this Ethereum transaction in one short, plain-English sentence (max 12 words):

Direction: ${isOutgoing ? 'Outgoing' : 'Incoming'}
ETH Value: ${ethValue} ETH
${tx.functionName ? `Contract Function: ${tx.functionName}` : ''}
${hasInput ? 'Has contract interaction data' : 'Simple ETH transfer'}
Status: ${tx.isError === '1' ? 'FAILED' : 'Success'}

Example outputs: "Sent 0.5 ETH to a DeFi swap contract", "Received 1.2 ETH payment", "Failed contract interaction"
Label:`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 30,
            temperature: 0.3,
        });

        const label = completion.choices[0]?.message?.content?.trim() ?? null;
        return label ?? generateFallbackLabel(tx, walletAddress);
    } catch {
        return generateFallbackLabel(tx, walletAddress);
    }
}

function generateFallbackLabel(tx: Transaction, walletAddress: string): string {
    const isOutgoing = tx.from.toLowerCase() === walletAddress.toLowerCase();
    const ethValue = (Number(tx.value) / 1e18);
    const type = tx.type;

    if (tx.isError === '1') return 'Failed transaction';
    if (type === 'swap') return `Swapped tokens via DeFi protocol`;
    if (type === 'contract') return `Interacted with smart contract`;
    if (isOutgoing && ethValue > 0) return `Sent ${ethValue.toFixed(4)} ETH`;
    if (!isOutgoing && ethValue > 0) return `Received ${ethValue.toFixed(4)} ETH`;
    return 'Contract interaction';
}

export async function POST(request: NextRequest) {
    try {
        const { address } = await request.json() as { address: string };

        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
        }

        // Fetch transactions from Etherscan
        const rawTransactions = await getTransactions(address, 10);

        if (rawTransactions.length === 0) {
            return NextResponse.json({ transactions: [] });
        }

        // Infer transaction types
        const typedTransactions = rawTransactions.map((tx) => ({
            ...tx,
            type: inferTransactionType(tx, address),
        }));

        // Label transactions with AI (rate-limited to avoid excessive API calls)
        // Run labeling in batches to avoid timeout
        const labeled: Transaction[] = [];

        // Label up to 5 transactions with AI to keep response fast
        const toLabel = typedTransactions.slice(0, 5);
        const rest = typedTransactions.slice(5);

        const labeledTop = await Promise.all(
            toLabel.map(async (tx) => ({
                ...tx,
                label: await labelTransaction(tx, address),
            }))
        );

        // Give fallback labels to the rest immediately
        const labeledRest = rest.map((tx) => ({
            ...tx,
            label: generateFallbackLabel(tx, address),
        }));

        labeled.push(...labeledTop, ...labeledRest);

        return NextResponse.json({ transactions: labeled });
    } catch (error) {
        console.error('[Transactions API] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
