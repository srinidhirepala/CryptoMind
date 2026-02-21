'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';
import ConnectWallet from '@/components/ConnectWallet';

const features = [
    {
        icon: '🔗',
        title: 'MetaMask Integration',
        description: 'One-click wallet connection with full ERC-20 token discovery and live ETH balance tracking.',
    },
    {
        icon: '🤖',
        title: 'AI Portfolio Summary',
        description: 'GPT-4o-mini analyzes your wallet and explains your portfolio in plain English, instantly.',
    },
    {
        icon: '💬',
        title: 'AI Chat Assistant',
        description: 'Ask anything — "Should I stake my ETH?" or "Is my portfolio risky?" Get personalized answers.',
    },
    {
        icon: '📊',
        title: 'Live Portfolio Dashboard',
        description: 'Real-time prices from CoinGecko, portfolio value, 24h changes, and beautiful charts.',
    },
    {
        icon: '🔍',
        title: 'Transaction History',
        description: 'Last 10 transactions with AI-generated plain English labels — no more cryptic hashes.',
    },
    {
        icon: '💰',
        title: 'Staking & Lending',
        description: 'Personalized DeFi recommendations with estimated APY and risk ratings for your assets.',
    },
];

const stats = [
    { label: 'AI-Powered Insights', value: '100%' },
    { label: 'Supported Tokens', value: '8+' },
    { label: 'Real-time Data', value: 'Live' },
    { label: 'Setup Time', value: '<1 min' },
];

export default function LandingPage() {
    const { walletState, connectWallet } = useWallet();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Particle animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: Array<{
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            opacity: number;
            color: string;
        }> = [];

        const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'];

        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.1,
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }

        let animId: number;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0');
                ctx.fill();
            });

            animId = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <main className="relative min-h-screen bg-navy-950 overflow-hidden">
            {/* Background canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
            />

            {/* Glow orbs */}
            <div className="glow-orb glow-orb-blue w-[600px] h-[600px] -top-32 -left-32 opacity-30" />
            <div className="glow-orb glow-orb-purple w-[500px] h-[500px] top-1/2 -right-48 opacity-20" />
            <div className="glow-orb glow-orb-cyan w-[400px] h-[400px] bottom-0 left-1/3 opacity-20" />

            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-blue">
                        <span className="text-xl">🧠</span>
                    </div>
                    <span className="text-xl font-bold gradient-text">CryptoMind</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="https://github.com"
                        className="hidden sm:flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
                        target="_blank"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        GitHub
                    </Link>
                    <ConnectWallet compact />
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-24 max-w-4xl mx-auto">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8 animate-fade-in">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse-slow" />
                    HakTa Global Hackathon 2025 · Powered by GitHub Copilot
                </div>

                {/* Main heading */}
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-6 animate-slide-up">
                    Your AI{' '}
                    <span className="gradient-text">Crypto Advisor</span>
                    <br />
                    Built In
                </h1>

                <p className="text-xl sm:text-2xl text-slate-400 max-w-2xl mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    Connect your MetaMask and instantly get{' '}
                    <span className="text-white font-medium">AI-powered portfolio insights</span>,
                    transaction explanations, and personalized DeFi recommendations — in plain English.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    {walletState.isConnected ? (
                        <Link
                            href="/dashboard"
                            className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-brand text-white font-bold text-lg shadow-glow-blue hover:opacity-90 transition-all duration-300 hover:scale-105"
                        >
                            <span>Go to Dashboard</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    ) : (
                        <button
                            onClick={connectWallet}
                            disabled={walletState.isConnecting}
                            className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-brand text-white font-bold text-lg shadow-glow-blue hover:opacity-90 transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                        >
                            {walletState.isConnecting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <svg className="w-6 h-6" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M32.958 1L19.188 11.47l2.501-5.942L32.958 1z" fill="#E17726" stroke="#E17726" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M2.042 1l13.624 10.57-2.384-6.042L2.042 1z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M28.226 23.533l-3.656 5.599 7.828 2.156 2.247-7.644-6.42-.111z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M.38 23.644l2.23 7.644 7.812-2.156-3.638-5.599L.38 23.644z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Connect MetaMask
                                </>
                            )}
                        </button>
                    )}
                    <a
                        href="#features"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-slate-700 text-slate-300 font-semibold text-lg hover:border-blue-500/50 hover:text-white transition-all duration-300"
                    >
                        Learn More
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </a>
                </div>

                {/* Error message */}
                {walletState.error && (
                    <div className="mt-6 px-6 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm max-w-md">
                        {walletState.error}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 w-full max-w-2xl animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-2xl font-black gradient-text mb-1">{stat.value}</div>
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
                <div className="text-center mb-14">
                    <h2 className="text-3xl sm:text-4xl font-black mb-4">
                        Everything You Need to{' '}
                        <span className="gradient-text">Understand Your Crypto</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        CryptoMind connects your wallet to AI, giving you the clarity that institutional investors have — for free.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <div
                            key={feature.title}
                            className="glass-card glass-card-hover p-6"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            <div className="text-3xl mb-4">{feature.icon}</div>
                            <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Banner */}
            <section className="relative z-10 px-6 py-16">
                <div className="max-w-3xl mx-auto text-center glass-card p-12 border-gradient">
                    <h2 className="text-3xl font-black mb-4">
                        Ready to understand your{' '}
                        <span className="gradient-text">crypto portfolio?</span>
                    </h2>
                    <p className="text-slate-400 mb-8">
                        Connect MetaMask in seconds. No sign-up, no data stored, fully private.
                    </p>
                    {!walletState.isConnected && (
                        <button
                            onClick={connectWallet}
                            disabled={walletState.isConnecting}
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-brand text-white font-bold text-lg shadow-glow-blue hover:opacity-90 transition-all hover:scale-105 disabled:opacity-60"
                        >
                            {walletState.isConnecting ? 'Connecting...' : 'Connect MetaMask — It\'s Free'}
                        </button>
                    )}
                    {walletState.isConnected && (
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-brand text-white font-bold text-lg shadow-glow-blue hover:opacity-90 transition-all hover:scale-105"
                        >
                            Open Dashboard →
                        </Link>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-slate-800/50 px-6 py-8">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <span className="text-lg">🧠</span>
                        <span>CryptoMind — HakTa Global Hackathon 2025</span>
                    </div>
                    <p className="text-slate-600 text-xs">
                        ⚠️ Not financial advice. For educational and demo purposes only.
                    </p>
                </div>
            </footer>
        </main>
    );
}
