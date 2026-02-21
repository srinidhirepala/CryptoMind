'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@/context/WalletContext';
import { formatTimestamp, cn } from '@/lib/utils';
import type { Transaction } from '@/types';

function TransactionIcon({ type }: { type: Transaction['type'] }) {
    const icons: Record<NonNullable<Transaction['type']>, { icon: string; color: string; bg: string }> = {
        send: { icon: '↑', color: 'text-rose-400', bg: 'bg-rose-500/10' },
        receive: { icon: '↓', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        swap: { icon: '⇄', color: 'text-blue-400', bg: 'bg-blue-500/10' },
        contract: { icon: '◈', color: 'text-violet-400', bg: 'bg-violet-500/10' },
        unknown: { icon: '?', color: 'text-slate-400', bg: 'bg-slate-500/10' },
    };

    const config = icons[type ?? 'unknown'];
    return (
        <div
            className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0',
                config.bg,
                config.color
            )}
        >
            {config.icon}
        </div>
    );
}

function TransactionRow({ tx, walletAddress }: { tx: Transaction; walletAddress: string }) {
    const [expanded, setExpanded] = useState(false);
    const isError = tx.isError === '1';
    const ethValue = (Number(tx.value) / 1e18).toFixed(6).replace(/\.?0+$/, '') || '0';

    return (
        <div
            className="group"
            role="listitem"
        >
            <button
                onClick={() => setExpanded((e) => !e)}
                className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors rounded-xl text-left"
            >
                {/* Icon */}
                <TransactionIcon type={tx.type} />

                {/* Main content */}
                <div className="flex-1 min-w-0">
                    {/* AI label */}
                    <p className="text-sm font-medium text-white truncate">
                        {tx.label ?? (isError ? '❌ Failed Transaction' : 'Transaction')}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-slate-500 truncate">
                            {tx.from.toLowerCase() === walletAddress.toLowerCase()
                                ? `To: ${tx.to.slice(0, 10)}...`
                                : `From: ${tx.from.slice(0, 10)}...`}
                        </p>
                        <span className="text-slate-700">•</span>
                        <p className="text-xs text-slate-500">{formatTimestamp(tx.timeStamp)}</p>
                    </div>
                </div>

                {/* Value */}
                <div className="text-right flex-shrink-0">
                    {parseFloat(ethValue) > 0 && (
                        <p
                            className={cn(
                                'text-sm font-semibold',
                                tx.from.toLowerCase() === walletAddress.toLowerCase()
                                    ? 'text-rose-400'
                                    : 'text-emerald-400'
                            )}
                        >
                            {tx.from.toLowerCase() === walletAddress.toLowerCase() ? '-' : '+'}{ethValue} ETH
                        </p>
                    )}
                    {isError && (
                        <span className="text-xs bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full">Failed</span>
                    )}
                </div>

                <svg
                    className={cn('w-4 h-4 text-slate-600 flex-shrink-0 transition-transform', expanded ? 'rotate-180' : '')}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Expanded details */}
            {expanded && (
                <div className="px-4 pb-4 pt-0 space-y-2 text-xs text-slate-400 ml-[52px]">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <p className="text-slate-600 mb-0.5">Tx Hash</p>
                            <a
                                href={`https://etherscan.io/tx/${tx.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 truncate block"
                            >
                                {tx.hash.slice(0, 20)}...
                            </a>
                        </div>
                        <div>
                            <p className="text-slate-600 mb-0.5">Gas Used</p>
                            <p className="text-slate-300">{parseInt(tx.gasUsed).toLocaleString()}</p>
                        </div>
                    </div>
                    {tx.functionName && (
                        <div>
                            <p className="text-slate-600 mb-0.5">Function</p>
                            <p className="text-violet-400 font-mono truncate">{tx.functionName.split('(')[0]}()</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function TransactionSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4">
            <div className="w-9 h-9 rounded-xl shimmer flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="w-48 h-3 rounded shimmer" />
                <div className="w-32 h-2 rounded shimmer" />
            </div>
            <div className="w-16 h-4 rounded shimmer" />
        </div>
    );
}

export default function TransactionList() {
    const { walletState } = useWallet();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasLoaded, setHasLoaded] = useState(false);

    const fetchTransactions = useCallback(async () => {
        if (!walletState.address) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: walletState.address }),
            });

            if (!response.ok) {
                const data = await response.json() as { error?: string };
                throw new Error(data.error ?? 'Failed to fetch transactions');
            }

            const data = await response.json() as { transactions: Transaction[] };
            setTransactions(data.transactions);
            setHasLoaded(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
        } finally {
            setIsLoading(false);
        }
    }, [walletState.address]);

    useEffect(() => {
        if (walletState.isConnected && walletState.address && !hasLoaded) {
            fetchTransactions();
        }
    }, [walletState.isConnected, walletState.address, hasLoaded, fetchTransactions]);

    return (
        <div className="glass-card" id="transaction-list">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-900/50 border border-blue-500/20 flex items-center justify-center text-lg">
                        🔍
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Transaction History</h3>
                        <p className="text-xs text-slate-500">Last 10 — AI-labeled</p>
                    </div>
                </div>
                {hasLoaded && (
                    <button
                        onClick={fetchTransactions}
                        disabled={isLoading}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                        <svg className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                )}
            </div>

            {/* Loading */}
            {isLoading && transactions.length === 0 && (
                <div role="list">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <TransactionSkeleton key={i} />
                    ))}
                </div>
            )}

            {/* Error */}
            {error && !isLoading && (
                <div className="p-6 flex flex-col items-center gap-3 text-center">
                    <div className="text-3xl">⚠️</div>
                    <p className="text-slate-400 text-sm">{error}</p>
                    <button
                        onClick={fetchTransactions}
                        className="text-xs text-blue-400 underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Empty */}
            {!isLoading && !error && transactions.length === 0 && hasLoaded && (
                <div className="p-6 flex flex-col items-center gap-3 text-center">
                    <div className="text-3xl">📭</div>
                    <p className="text-slate-400 text-sm">No transactions found for this wallet.</p>
                </div>
            )}

            {/* Not connected */}
            {!walletState.isConnected && (
                <div className="p-6 flex flex-col items-center gap-3 text-center">
                    <div className="text-3xl">🔗</div>
                    <p className="text-slate-400 text-sm">Connect your wallet to view transactions.</p>
                </div>
            )}

            {/* Transaction list */}
            {transactions.length > 0 && (
                <div role="list" className="divide-y divide-slate-800/30">
                    {transactions.map((tx) => (
                        <TransactionRow
                            key={tx.hash}
                            tx={tx}
                            walletAddress={walletState.address ?? ''}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
