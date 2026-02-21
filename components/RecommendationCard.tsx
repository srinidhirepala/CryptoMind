'use client';

import type { Recommendation } from '@/types';
import { cn } from '@/lib/utils';

interface RecommendationCardProps {
    recommendation: Recommendation;
}

const riskConfig = {
    Low: {
        label: 'Low Risk',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        dot: 'bg-emerald-400',
    },
    Medium: {
        label: 'Medium Risk',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        dot: 'bg-amber-400',
    },
    High: {
        label: 'High Risk',
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        dot: 'bg-rose-400',
    },
};

const typeIcons: Record<Recommendation['type'], string> = {
    staking: '🏦',
    lending: '💸',
    yield: '🌱',
    liquidity: '💧',
};

const typeLabels: Record<Recommendation['type'], string> = {
    staking: 'Staking',
    lending: 'Lending',
    yield: 'Yield Farming',
    liquidity: 'Liquidity Pool',
};

export default function RecommendationCard({ recommendation: rec }: RecommendationCardProps) {
    const risk = riskConfig[rec.riskLevel];

    return (
        <div className="glass-card glass-card-hover p-5 flex flex-col gap-4" role="article">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-navy-700 border border-slate-700/50 flex items-center justify-center text-xl">
                        {typeIcons[rec.type]}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm leading-none">{rec.protocol}</h3>
                        <p className="text-slate-500 text-xs mt-1">{typeLabels[rec.type]} · {rec.asset}</p>
                    </div>
                </div>

                {/* Risk badge */}
                <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border', risk.bg, risk.color, risk.border)}>
                    <div className={cn('w-1.5 h-1.5 rounded-full', risk.dot)} />
                    {rec.riskLevel}
                </div>
            </div>

            {/* APY */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-navy-800/60 border border-slate-700/30">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Estimated APY</span>
                <span className="text-2xl font-black gradient-text-gold">{rec.apy.toFixed(1)}%</span>
            </div>

            {/* Description */}
            <p className="text-slate-400 text-sm leading-relaxed">{rec.description}</p>

            {/* Min amount */}
            {rec.minAmount && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Min amount: <span className="text-slate-300 font-medium">{rec.minAmount}</span>
                </div>
            )}

            {/* Tags */}
            {rec.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {rec.tags.map((tag) => (
                        <span
                            key={tag}
                            className="text-xs px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* CTA */}
            {rec.url ? (
                <a
                    href={rec.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto w-full text-center py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-semibold hover:opacity-90 transition-all hover:scale-[1.02]"
                >
                    Explore on {rec.protocol} →
                </a>
            ) : (
                <div className="mt-auto w-full text-center py-2.5 rounded-xl bg-navy-700 border border-slate-700/50 text-slate-500 text-sm">
                    Demo — Not a live link
                </div>
            )}
        </div>
    );
}

// Static recommended staking/lending opportunities for demo
export const DEMO_RECOMMENDATIONS: Recommendation[] = [
    {
        id: 'lido-steth',
        protocol: 'Lido Finance',
        asset: 'ETH',
        type: 'staking',
        apy: 4.2,
        minAmount: '0.01 ETH',
        riskLevel: 'Low',
        description:
            'Stake your ETH with Lido and earn stETH, which automatically accrues staking rewards. The most liquid ETH staking solution with no lock-up period.',
        url: 'https://lido.fi',
        tags: ['Liquid Staking', 'No Lock-up', 'DeFi Blue Chip'],
    },
    {
        id: 'aave-usdc',
        protocol: 'Aave v3',
        asset: 'USDC',
        type: 'lending',
        apy: 5.1,
        minAmount: '100 USDC',
        riskLevel: 'Low',
        description:
            'Deposit USDC into Aave\'s lending pool and earn interest from borrowers. One of the most battle-tested DeFi protocols with $10B+ TVL.',
        url: 'https://aave.com',
        tags: ['Stablecoin', 'Battle-tested', 'High Liquidity'],
    },
    {
        id: 'eigenlayer-eth',
        protocol: 'EigenLayer',
        asset: 'ETH',
        type: 'staking',
        apy: 6.8,
        minAmount: '0.1 ETH',
        riskLevel: 'Medium',
        description:
            'Restake your ETH to secure multiple protocols simultaneously via EigenLayer and earn additional rewards on top of standard staking yields.',
        url: 'https://eigenlayer.xyz',
        tags: ['Restaking', 'Points', 'Emerging'],
    },
    {
        id: 'compound-dai',
        protocol: 'Compound v3',
        asset: 'DAI',
        type: 'lending',
        apy: 4.8,
        minAmount: '50 DAI',
        riskLevel: 'Low',
        description:
            'Supply DAI to Compound to earn steady interest. Compound is one of the original DeFi lending protocols with a proven track record since 2018.',
        url: 'https://compound.finance',
        tags: ['Stablecoin', 'OG DeFi', 'COMP Rewards'],
    },
    {
        id: 'uniswap-eth-usdc',
        protocol: 'Uniswap v3',
        asset: 'ETH/USDC',
        type: 'liquidity',
        apy: 12.5,
        minAmount: '$500 equivalent',
        riskLevel: 'High',
        description:
            'Provide liquidity to the ETH/USDC pool on Uniswap v3. Earn trading fees but be aware of impermanent loss risk in volatile market conditions.',
        url: 'https://app.uniswap.org',
        tags: ['LP Fees', 'Impermanent Loss', 'Active Management'],
    },
    {
        id: 'rocketpool-reth',
        protocol: 'Rocket Pool',
        asset: 'ETH',
        type: 'staking',
        apy: 3.9,
        minAmount: '0.01 ETH',
        riskLevel: 'Low',
        description:
            'Mint rETH by depositing ETH with Rocket Pool\'s decentralized staking network. More decentralized than Lido with no single points of failure.',
        url: 'https://rocketpool.net',
        tags: ['Decentralized', 'rETH', 'No KYC'],
    },
];
