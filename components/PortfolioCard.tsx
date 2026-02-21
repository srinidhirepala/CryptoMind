'use client';

import { formatUSD, formatBalance, formatPercent, cn } from '@/lib/utils';
import type { Token } from '@/types';

interface PortfolioCardProps {
    token: Token;
    totalUsdValue: number;
}

export default function PortfolioCard({ token, totalUsdValue }: PortfolioCardProps) {
    const isPositive = token.priceChange24h >= 0;
    const portfolioPercent = totalUsdValue > 0 ? (token.usdValue / totalUsdValue) * 100 : 0;

    return (
        <div
            className="glass-card glass-card-hover p-5 group cursor-default"
            role="article"
            aria-label={`${token.name} portfolio card`}
        >
            {/* Header: Token logo + name + symbol */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        {token.logoUrl ? (
                            <img
                                src={token.logoUrl}
                                alt={`${token.symbol} logo`}
                                className="w-10 h-10 rounded-full ring-2 ring-slate-700/50"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${token.symbol}&background=1e3a5f&color=60a5fa&size=40`;
                                }}
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-sm ring-2 ring-slate-700/50">
                                {token.symbol.slice(0, 2)}
                            </div>
                        )}
                        {/* Portfolio share badge */}
                        {portfolioPercent > 5 && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-navy-800 flex items-center justify-center">
                                <div
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{
                                        background: `conic-gradient(#3b82f6 ${portfolioPercent}%, transparent 0)`,
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-white text-sm leading-none">{token.name}</h3>
                        <p className="text-slate-500 text-xs mt-1">{token.symbol}</p>
                    </div>
                </div>

                {/* 24h change */}
                <div
                    className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold',
                        isPositive
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                    )}
                >
                    {isPositive ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    )}
                    {Math.abs(token.priceChange24h).toFixed(2)}%
                </div>
            </div>

            {/* Balance & USD value */}
            <div className="space-y-1">
                <p className="text-slate-400 text-xs uppercase tracking-wider">Balance</p>
                <p className="text-lg font-bold text-white counter">
                    {formatBalance(token.balance)} <span className="text-slate-400 font-normal text-sm">{token.symbol}</span>
                </p>
                <div className="flex items-baseline justify-between">
                    <p className="text-2xl font-black text-white counter">{formatUSD(token.usdValue)}</p>
                    <p className="text-xs text-slate-500">@ {formatUSD(token.usdPrice, 2)}/{token.symbol}</p>
                </div>
            </div>

            {/* Portfolio allocation bar */}
            <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500">Portfolio share</span>
                    <span className="text-xs font-semibold text-slate-300">{portfolioPercent.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-brand rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(portfolioPercent, 100)}%` }}
                    />
                </div>
            </div>

            {/* Price change context */}
            <div className="mt-3 pt-3 border-t border-slate-800/50 flex items-center justify-between">
                <span className="text-xs text-slate-500">24h change</span>
                <span className={cn('text-xs font-semibold', isPositive ? 'text-emerald-400' : 'text-rose-400')}>
                    {isPositive ? '+' : ''}{formatUSD(Math.abs((token.priceChange24h / 100) * token.usdValue))}
                </span>
            </div>
        </div>
    );
}

// Loading skeleton
export function PortfolioCardSkeleton() {
    return (
        <div className="glass-card p-5">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full shimmer" />
                    <div className="space-y-2">
                        <div className="w-20 h-3 rounded shimmer" />
                        <div className="w-10 h-2 rounded shimmer" />
                    </div>
                </div>
                <div className="w-14 h-6 rounded-lg shimmer" />
            </div>
            <div className="space-y-2">
                <div className="w-12 h-2 rounded shimmer" />
                <div className="w-32 h-5 rounded shimmer" />
                <div className="w-24 h-7 rounded shimmer" />
            </div>
            <div className="mt-4 h-1.5 rounded-full shimmer" />
        </div>
    );
}
