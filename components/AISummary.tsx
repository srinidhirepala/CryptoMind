'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@/context/WalletContext';

interface AISummaryProps {
    className?: string;
}

export default function AISummary({ className = '' }: AISummaryProps) {
    const { walletState } = useWallet();
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasLoaded, setHasLoaded] = useState(false);

    const fetchSummary = useCallback(async () => {
        if (!walletState.isConnected || walletState.tokens.length === 0) return;

        setIsLoading(true);
        setError(null);
        setSummary('');

        try {
            const walletData = {
                address: walletState.address,
                totalUsdValue: walletState.totalUsdValue,
                totalChange24h: walletState.totalChange24h,
                chainName: walletState.chainName,
                tokens: walletState.tokens.map((t) => ({
                    symbol: t.symbol,
                    name: t.name,
                    balance: t.balance,
                    usdValue: t.usdValue,
                    priceChange24h: t.priceChange24h,
                })),
            };

            const response = await fetch('/api/ai-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletData }),
            });

            if (!response.ok) {
                const errorData = await response.json() as { error?: string };
                throw new Error(errorData.error ?? 'Failed to generate summary');
            }

            if (!response.body) throw new Error('No response stream');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                setSummary((prev) => prev + chunk);
            }

            setHasLoaded(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate AI summary');
        } finally {
            setIsLoading(false);
        }
    }, [walletState]);

    useEffect(() => {
        if (walletState.isConnected && walletState.tokens.length > 0 && !hasLoaded) {
            fetchSummary();
        }
    }, [walletState.isConnected, walletState.tokens.length, hasLoaded, fetchSummary]);

    if (!walletState.isConnected) return null;

    return (
        <div className={`glass-card p-6 ${className}`} id="ai-summary-card">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-glow-purple">
                        <span className="text-lg">🤖</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">AI Portfolio Analysis</h3>
                        <p className="text-xs text-slate-500">Powered by GPT-4o-mini</p>
                    </div>
                </div>
                {hasLoaded && (
                    <button
                        onClick={fetchSummary}
                        disabled={isLoading}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 disabled:opacity-50"
                        title="Refresh summary"
                    >
                        <svg
                            className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        Refresh
                    </button>
                )}
            </div>

            {/* Content */}
            {isLoading && !summary && (
                <div className="space-y-3">
                    <div className="h-4 w-full rounded shimmer" />
                    <div className="h-4 w-5/6 rounded shimmer" />
                    <div className="h-4 w-4/6 rounded shimmer" />
                    <div className="h-4 w-5/6 rounded shimmer" />
                    <div className="flex items-center gap-2 mt-4">
                        <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="loader-dot w-2 h-2 rounded-full bg-blue-400"
                                    style={{ animationDelay: `${i * -0.16}s` }}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-slate-500 animate-pulse">AI is analyzing your portfolio...</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <svg className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-rose-400 text-sm font-medium">Couldn&apos;t generate summary</p>
                        <p className="text-rose-400/70 text-xs mt-0.5">{error}</p>
                        <button onClick={fetchSummary} className="text-xs text-rose-400 underline mt-2">
                            Try again
                        </button>
                    </div>
                </div>
            )}

            {summary && (
                <div className="relative">
                    <p className="text-slate-300 text-sm leading-relaxed">
                        {summary}
                        {isLoading && <span className="cursor-blink" aria-hidden="true" />}
                    </p>
                    {!isLoading && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Not financial advice — for informational purposes only.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
