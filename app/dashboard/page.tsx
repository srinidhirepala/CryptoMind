'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import ConnectWallet from '@/components/ConnectWallet';
import PortfolioCard, { PortfolioCardSkeleton } from '@/components/PortfolioCard';
import PortfolioChart, { PortfolioChartSkeleton } from '@/components/PortfolioChart';
import AISummary from '@/components/AISummary';
import ChatAssistant from '@/components/ChatAssistant';
import TransactionList from '@/components/TransactionList';
import RecommendationCard, { DEMO_RECOMMENDATIONS } from '@/components/RecommendationCard';
import { generateChartData, formatUSD, formatPercent, cn } from '@/lib/utils';

export default function DashboardPage() {
    const { walletState, refreshPortfolio } = useWallet();
    const router = useRouter();

    // Redirect to home if not connected after a brief delay
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!walletState.isConnected && !walletState.isConnecting) {
                router.push('/');
            }
        }, 2000);
        return () => clearTimeout(timeout);
    }, [walletState.isConnected, walletState.isConnecting, router]);

    const chartData = useMemo(
        () => generateChartData(walletState.tokens),
        [walletState.tokens]
    );

    const handleRefresh = useCallback(async () => {
        await refreshPortfolio();
    }, [refreshPortfolio]);

    const isLoading = walletState.isConnecting;
    const isPositive = walletState.totalChange24h >= 0;

    // Filter recommendations based on wallet holdings
    const relevantRecommendations = useMemo(() => {
        const hasETH = walletState.tokens.some((t) => t.symbol === 'ETH' && parseFloat(t.balance) > 0.01);
        const hasUSDC = walletState.tokens.some((t) => t.symbol === 'USDC' && parseFloat(t.balance) > 100);
        const hasDAI = walletState.tokens.some((t) => t.symbol === 'DAI' && parseFloat(t.balance) > 50);

        // If connected with real data, filter; otherwise show all
        if (!walletState.isConnected || walletState.tokens.length === 0) {
            return DEMO_RECOMMENDATIONS;
        }

        return DEMO_RECOMMENDATIONS.filter((rec) => {
            if (rec.asset === 'ETH' || rec.asset === 'ETH/USDC') return hasETH;
            if (rec.asset === 'USDC') return hasUSDC;
            if (rec.asset === 'DAI') return hasDAI;
            return true;
        });
    }, [walletState.tokens, walletState.isConnected]);

    return (
        <div className="min-h-screen bg-navy-950">
            {/* Top Nav */}
            <header className="sticky top-0 z-30 bg-navy-950/80 backdrop-blur-md border-b border-slate-800/50">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-blue group-hover:opacity-90 transition-opacity">
                            <span className="text-lg">🧠</span>
                        </div>
                        <span className="text-lg font-black gradient-text hidden sm:block">CryptoMind</span>
                    </a>

                    {/* Center: Portfolio Value at a glance */}
                    {walletState.isConnected && walletState.totalUsdValue > 0 && (
                        <div className="hidden md:flex items-center gap-4 pl-4 border-l border-slate-800">
                            <div>
                                <p className="text-xs text-slate-500">Portfolio Value</p>
                                <p className="text-lg font-black text-white counter">{formatUSD(walletState.totalUsdValue)}</p>
                            </div>
                            <div
                                className={cn(
                                    'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-semibold',
                                    isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                )}
                            >
                                {isPositive ? '↑' : '↓'}
                                {formatPercent(Math.abs(walletState.totalChange24h))} 24h
                            </div>
                        </div>
                    )}

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        {/* Network badge */}
                        {walletState.chainName && (
                            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy-700 border border-slate-700/50 text-xs text-slate-400">
                                <div className={cn(
                                    'w-1.5 h-1.5 rounded-full',
                                    walletState.chainId === 1 ? 'bg-emerald-400' : 'bg-amber-400'
                                )} />
                                {walletState.chainName}
                            </div>
                        )}

                        {/* Refresh */}
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="p-2 rounded-xl bg-navy-700 border border-slate-700/50 text-slate-400 hover:text-white hover:border-blue-500/50 transition-all disabled:opacity-40"
                            title="Refresh portfolio"
                            id="refresh-btn"
                        >
                            <svg className={cn('w-4 h-4', isLoading && 'animate-spin')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>

                        <ConnectWallet compact />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 pb-32 space-y-6" id="dashboard-main">

                {/* Not connected state */}
                {!walletState.isConnected && !walletState.isConnecting && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
                        <div className="text-6xl animate-bounce-slow">🔗</div>
                        <h2 className="text-2xl font-bold text-white">Wallet Not Connected</h2>
                        <p className="text-slate-400 max-w-md">
                            Connect your MetaMask wallet to view your portfolio, AI insights, and transaction history.
                        </p>
                        <a
                            href="/"
                            className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-semibold hover:opacity-90 transition-all hover:scale-105"
                        >
                            ← Back to Home
                        </a>
                    </div>
                )}

                {/* Connecting state */}
                {walletState.isConnecting && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-slate-400">Connecting to MetaMask...</p>
                    </div>
                )}

                {walletState.isConnected && (
                    <>
                        {/* === ROW 1: AI Summary === */}
                        <AISummary />

                        {/* === ROW 2: Portfolio Stats + Chart === */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Stats cards */}
                            <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
                                {/* Total Value */}
                                <div className="glass-card p-5">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Total Portfolio</p>
                                    <p className="text-3xl font-black text-white counter">
                                        {formatUSD(walletState.totalUsdValue)}
                                    </p>
                                    <div className={cn(
                                        'flex items-center gap-1.5 mt-2 text-sm font-semibold',
                                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                                    )}>
                                        {isPositive ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                        )}
                                        {formatPercent(Math.abs(walletState.totalChange24h))} today
                                    </div>
                                </div>

                                {/* ETH Balance */}
                                <div className="glass-card p-5">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">ETH Balance</p>
                                    <p className="text-2xl font-black text-white counter">
                                        {parseFloat(walletState.ethBalance ?? '0').toFixed(4)}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">ETH</p>
                                </div>

                                {/* Token Count */}
                                <div className="glass-card p-5">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Assets</p>
                                    <p className="text-2xl font-black text-white">{walletState.tokens.length}</p>
                                    <p className="text-sm text-slate-500 mt-1">tokens tracked</p>
                                </div>

                                {/* Wallet Address */}
                                <div className="glass-card p-5">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Wallet</p>
                                    <p className="text-sm font-mono text-blue-400 truncate">
                                        {walletState.address?.slice(0, 12)}...
                                    </p>
                                    <a
                                        href={`https://etherscan.io/address/${walletState.address}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-slate-500 hover:text-slate-300 mt-1 flex items-center gap-1 transition-colors"
                                    >
                                        View on Etherscan ↗
                                    </a>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="lg:col-span-2">
                                {walletState.tokens.length > 0 ? (
                                    <PortfolioChart data={chartData} totalValue={walletState.totalUsdValue} />
                                ) : (
                                    <PortfolioChartSkeleton />
                                )}
                            </div>
                        </div>

                        {/* === ROW 3: Token Cards === */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="text-xl">💼</span>
                                    Your Holdings
                                </h2>
                                <span className="text-xs text-slate-500">{walletState.tokens.length} tokens</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {walletState.tokens.length > 0
                                    ? walletState.tokens
                                        .sort((a, b) => b.usdValue - a.usdValue)
                                        .map((token) => (
                                            <PortfolioCard
                                                key={token.contractAddress ?? token.symbol}
                                                token={token}
                                                totalUsdValue={walletState.totalUsdValue}
                                            />
                                        ))
                                    : [1, 2, 3].map((i) => <PortfolioCardSkeleton key={i} />)}
                            </div>
                        </div>

                        {/* === ROW 4: Transactions + Recommendations === */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            <TransactionList />

                            {/* Recommendations */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-9 h-9 rounded-xl bg-amber-900/50 border border-amber-500/20 flex items-center justify-center text-lg">
                                        💰
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Staking & Lending</h3>
                                        <p className="text-xs text-slate-500">AI-matched opportunities</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {(relevantRecommendations.length > 0
                                        ? relevantRecommendations
                                        : DEMO_RECOMMENDATIONS
                                    )
                                        .slice(0, 4)
                                        .map((rec) => (
                                            <RecommendationCard key={rec.id} recommendation={rec} />
                                        ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* Chat Assistant — fixed right panel */}
            <ChatAssistant />
        </div>
    );
}
