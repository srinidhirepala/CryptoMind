'use client';

import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { truncateAddress } from '@/lib/utils';
import { isMetaMaskInstalled } from '@/lib/ethers';

interface ConnectWalletProps {
    compact?: boolean;
}

export default function ConnectWallet({ compact = false }: ConnectWalletProps) {
    const { walletState, connectWallet, disconnectWallet } = useWallet();
    const [showDropdown, setShowDropdown] = useState(false);
    const [noMetaMask, setNoMetaMask] = useState(false);

    const handleConnect = async () => {
        if (!isMetaMaskInstalled()) {
            setNoMetaMask(true);
            setTimeout(() => setNoMetaMask(false), 4000);
            return;
        }
        await connectWallet();
    };

    const handleDisconnect = () => {
        setShowDropdown(false);
        disconnectWallet();
    };

    // Network badge color
    const networkColor =
        walletState.chainId === 1
            ? 'bg-emerald-500'
            : walletState.chainId === 137
                ? 'bg-violet-500'
                : 'bg-amber-500';

    if (walletState.isConnected && walletState.address) {
        if (compact) {
            return (
                <div className="relative">
                    <button
                        id="wallet-address-btn"
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-navy-700 border border-slate-700 hover:border-blue-500/50 transition-all text-sm font-mono"
                    >
                        <div className={`w-2 h-2 rounded-full ${networkColor} animate-pulse`} />
                        <span className="text-slate-300">{truncateAddress(walletState.address)}</span>
                        <svg className={`w-3 h-3 text-slate-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-56 glass-card shadow-card border border-slate-700/50 z-50 overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-700/50">
                                <p className="text-xs text-slate-500 mb-1">Connected Wallet</p>
                                <p className="text-sm font-mono text-white">{truncateAddress(walletState.address, 6)}</p>
                                {walletState.chainName && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${networkColor}`} />
                                        <span className="text-xs text-slate-400">{walletState.chainName}</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-2">
                                <button
                                    onClick={() => navigator.clipboard.writeText(walletState.address!)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-blue-500/10 hover:text-white transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy Address
                                </button>
                                <a
                                    href={`https://etherscan.io/address/${walletState.address}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-blue-500/10 hover:text-white transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    View on Etherscan
                                </a>
                                <button
                                    onClick={handleDisconnect}
                                    id="disconnect-btn"
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Disconnect
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // Full connected state display
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-700 border border-slate-700">
                    <div className={`w-2 h-2 rounded-full ${networkColor} animate-pulse`} />
                    <span className="text-sm text-slate-300 font-mono">{truncateAddress(walletState.address)}</span>
                </div>
                <button
                    onClick={handleDisconnect}
                    className="px-4 py-2 rounded-xl border border-rose-500/30 text-rose-400 text-sm hover:bg-rose-500/10 transition-colors"
                >
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                id="connect-wallet-btn"
                onClick={handleConnect}
                disabled={walletState.isConnecting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-brand text-white font-semibold text-sm shadow-glow-blue hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105"
            >
                {walletState.isConnecting ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Connecting...
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" viewBox="0 0 35 33" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                            <path d="M32.958 1L19.188 11.47l2.501-5.942L32.958 1z" />
                            <path d="M2.042 1l13.624 10.57-2.384-6.042L2.042 1z" />
                        </svg>
                        {compact ? 'Connect' : 'Connect MetaMask'}
                    </>
                )}
            </button>

            {noMetaMask && (
                <div className="absolute top-full mt-2 right-0 w-64 px-4 py-3 rounded-xl bg-amber-900/80 border border-amber-500/50 text-amber-300 text-xs shadow-lg z-50">
                    <p className="font-semibold mb-1">MetaMask Not Installed</p>
                    <p>Please install the MetaMask browser extension to connect your wallet.</p>
                    <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-200 underline mt-1 block"
                    >
                        Download MetaMask →
                    </a>
                </div>
            )}
        </div>
    );
}
