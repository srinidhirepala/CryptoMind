import type { Transaction, EtherscanResponse } from '@/types';

const ETHERSCAN_BASE = 'https://api.etherscan.io/api';

/**
 * Fetches the last N transactions for a given Ethereum address.
 * Uses the Etherscan API (free tier, no key needed for basic usage, but it's rate-limited).
 * For production, set ETHERSCAN_API_KEY in .env.local
 */
export async function getTransactions(
    address: string,
    limit = 10
): Promise<Transaction[]> {
    const apiKey = process.env.ETHERSCAN_API_KEY ?? '';

    const params = new URLSearchParams({
        module: 'account',
        action: 'txlist',
        address,
        startblock: '0',
        endblock: '99999999',
        page: '1',
        offset: String(limit),
        sort: 'desc',
        ...(apiKey ? { apikey: apiKey } : {}),
    });

    try {
        const response = await fetch(`${ETHERSCAN_BASE}?${params}`, {
            headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`Etherscan API error: ${response.status}`);
        }

        const data = (await response.json()) as EtherscanResponse;

        if (data.status !== '1') {
            // "No transactions found" is a valid case
            if (data.message === 'No transactions found') {
                return [];
            }
            console.warn('Etherscan message:', data.message);
            return [];
        }

        return data.result.map((tx) => ({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            timeStamp: tx.timeStamp,
            gas: tx.gas,
            gasPrice: tx.gasPrice,
            gasUsed: tx.gasUsed,
            isError: tx.isError,
            input: tx.input,
            functionName: tx.functionName,
            label: undefined,
            type: 'unknown',
        }));
    } catch (error) {
        console.error('Etherscan fetch error:', error);
        return [];
    }
}

/**
 * Determines the type of a transaction based on available data
 */
export function inferTransactionType(
    tx: Transaction,
    walletAddress: string
): Transaction['type'] {
    const addr = walletAddress.toLowerCase();
    const from = tx.from.toLowerCase();
    const to = tx.to?.toLowerCase() ?? '';
    const input = tx.input ?? '0x';

    if (from === addr && to === addr) return 'unknown';

    // Contract interaction (has input data beyond just '0x')
    if (input !== '0x' && input.length > 2) {
        // Check function signatures for common DeFi functions
        const sig = input.slice(0, 10);
        const swapSigs = ['0x38ed1739', '0x7ff36ab5', '0x18cbafe5', '0xd9627aa4', '0x2e95b6c8'];
        if (swapSigs.includes(sig)) return 'swap';
        return 'contract';
    }

    if (from === addr) return 'send';
    if (to === addr) return 'receive';

    return 'unknown';
}

/**
 * Formats a wei value to ETH with up to 6 decimal places
 */
export function weiToEth(weiValue: string): string {
    const wei = BigInt(weiValue);
    const eth = Number(wei) / 1e18;
    if (eth === 0) return '0';
    if (eth < 0.000001) return '<0.000001';
    return eth.toFixed(6).replace(/\.?0+$/, '');
}

/**
 * Formats a unix timestamp string to a readable date
 */
export function formatTransactionDate(timestamp: string): string {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
