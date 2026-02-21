import type { Token, CoinGeckoPrice } from '@/types';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// Cache to avoid rate-limiting (60 calls/min on free tier)
const priceCache = new Map<string, { data: CoinGeckoPrice; timestamp: number }>();
const CACHE_TTL = 60_000; // 1 minute

/**
 * Fetches USD prices + 24h change for a list of CoinGecko IDs
 */
export async function getPricesByIds(
    ids: string[]
): Promise<Record<string, CoinGeckoPrice>> {
    if (ids.length === 0) return {};

    const now = Date.now();
    const uncachedIds: string[] = [];
    const result: Record<string, CoinGeckoPrice> = {};

    // Check cache first
    for (const id of ids) {
        const cached = priceCache.get(id);
        if (cached && now - cached.timestamp < CACHE_TTL) {
            result[id] = cached.data;
        } else {
            uncachedIds.push(id);
        }
    }

    if (uncachedIds.length > 0) {
        const idsParam = uncachedIds.join(',');
        const url = `${COINGECKO_BASE}/simple/price?ids=${idsParam}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;

        try {
            const response = await fetch(url, {
                headers: {
                    Accept: 'application/json',
                },
                next: { revalidate: 60 },
            });

            if (!response.ok) {
                throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
            }

            const data = (await response.json()) as Record<
                string,
                { usd: number; usd_24h_change: number; usd_market_cap?: number; usd_24h_vol?: number }
            >;

            for (const id of uncachedIds) {
                if (data[id]) {
                    const priceData: CoinGeckoPrice = {
                        usd: data[id].usd ?? 0,
                        usd_24h_change: data[id].usd_24h_change ?? 0,
                        usd_market_cap: data[id].usd_market_cap,
                        usd_24h_vol: data[id].usd_24h_vol,
                    };
                    priceCache.set(id, { data: priceData, timestamp: now });
                    result[id] = priceData;
                }
            }
        } catch (error) {
            console.error('CoinGecko price fetch error:', error);
            // Return empty prices for failed tokens
            for (const id of uncachedIds) {
                result[id] = { usd: 0, usd_24h_change: 0 };
            }
        }
    }

    return result;
}

/**
 * Enriches token array with live USD prices and 24h change from CoinGecko
 */
export async function enrichTokensWithPrices(tokens: Token[]): Promise<Token[]> {
    const coingeckoIds = tokens
        .map((t) => t.coingeckoId)
        .filter((id): id is string => !!id);

    // Always include ETH
    const allIds = ['ethereum', ...coingeckoIds];
    const prices = await getPricesByIds(allIds);

    return tokens.map((token) => {
        const id = token.coingeckoId;
        if (id && prices[id]) {
            const price = prices[id];
            const balanceNum = parseFloat(token.balance);
            return {
                ...token,
                usdPrice: price.usd,
                usdValue: balanceNum * price.usd,
                priceChange24h: price.usd_24h_change,
            };
        }
        return token;
    });
}

/**
 * Get ETH price from CoinGecko
 */
export async function getETHPrice(): Promise<CoinGeckoPrice> {
    const prices = await getPricesByIds(['ethereum']);
    return prices['ethereum'] ?? { usd: 0, usd_24h_change: 0 };
}

/**
 * Search tokens by symbol on CoinGecko
 */
export async function searchToken(query: string): Promise<Array<{ id: string; symbol: string; name: string }>> {
    try {
        const url = `${COINGECKO_BASE}/search?query=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json() as {
            coins: Array<{ id: string; symbol: string; name: string; market_cap_rank: number }>;
        };
        return data.coins.slice(0, 5).map((c) => ({
            id: c.id,
            symbol: c.symbol.toUpperCase(),
            name: c.name,
        }));
    } catch {
        return [];
    }
}

/**
 * Fetch sparkline / historical prices for a coin (last 7 days)
 */
export async function getHistoricalPrices(
    coinId: string,
    days = 7
): Promise<Array<{ time: number; price: number }>> {
    try {
        const url = `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`;
        const response = await fetch(url, { next: { revalidate: 300 } });
        if (!response.ok) throw new Error('Historical price fetch failed');
        const data = await response.json() as { prices: [number, number][] };
        return data.prices.map(([time, price]) => ({ time, price }));
    } catch {
        return [];
    }
}
