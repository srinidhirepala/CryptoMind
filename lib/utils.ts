import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatUSD(value: number, decimals = 2): string {
    if (value >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
        return `$${(value / 1_000).toFixed(2)}K`;
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}%`;
}

export function formatBalance(balance: string, maxDecimals = 6): string {
    const num = parseFloat(balance);
    if (isNaN(num)) return '0';
    if (num === 0) return '0';
    if (num < 0.000001) return '<0.000001';
    if (num < 1) return num.toFixed(maxDecimals).replace(/\.?0+$/, '');
    if (num < 1000) return num.toFixed(4).replace(/\.?0+$/, '');
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
}

export function truncateAddress(address: string, chars = 4): string {
    if (!address) return '';
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTimestamp(timestamp: string): string {
    const date = new Date(parseInt(timestamp) * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMins = Math.floor(diffMs / (1000 * 60));
            return `${diffMins}m ago`;
        }
        return `${diffHours}h ago`;
    }
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Generate consistent colors for chart segments
export const CHART_COLORS = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#10b981', // emerald
    '#f59e0b', // amber
    '#f43f5e', // rose
    '#84cc16', // lime
    '#ec4899', // pink
    '#14b8a6', // teal
    '#a855f7', // violet
];

export function generateChartData(
    tokens: Array<{ symbol: string; usdValue: number }>
): Array<{ name: string; value: number; color: string; percent: number }> {
    const total = tokens.reduce((sum, t) => sum + t.usdValue, 0);
    if (total === 0) return [];

    return tokens
        .filter((t) => t.usdValue > 0)
        .sort((a, b) => b.usdValue - a.usdValue)
        .map((token, i) => ({
            name: token.symbol,
            value: token.usdValue,
            color: CHART_COLORS[i % CHART_COLORS.length],
            percent: (token.usdValue / total) * 100,
        }));
}
