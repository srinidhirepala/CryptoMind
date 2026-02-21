'use client';

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    type ReactNode,
} from 'react';
import type { WalletState, WalletContextType, Token } from '@/types';
import {
    connectMetaMask,
    getETHBalance,
    getTokenBalances,
    getChainInfo,
    isMetaMaskInstalled,
} from '@/lib/ethers';
import { enrichTokensWithPrices, getETHPrice } from '@/lib/coingecko';

const initialState: WalletState = {
    address: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
    chainName: null,
    ethBalance: null,
    tokens: [],
    totalUsdValue: 0,
    totalChange24h: 0,
    error: null,
};

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [walletState, setWalletState] = useState<WalletState>(initialState);

    const refreshPortfolio = useCallback(async () => {
        if (!walletState.address) return;

        try {
            const [ethBalance, chainInfo, rawTokens, ethPrice] = await Promise.all([
                getETHBalance(walletState.address),
                getChainInfo(),
                getTokenBalances(walletState.address),
                getETHPrice(),
            ]);

            const ethToken: Token = {
                symbol: 'ETH',
                name: 'Ethereum',
                contractAddress: null,
                balance: ethBalance,
                decimals: 18,
                usdPrice: ethPrice.usd,
                usdValue: parseFloat(ethBalance) * ethPrice.usd,
                priceChange24h: ethPrice.usd_24h_change,
                logoUrl: 'https://coin-images.coingecko.com/coins/images/279/small/ethereum.png',
                coingeckoId: 'ethereum',
            };

            const enrichedTokens = await enrichTokensWithPrices(rawTokens);
            const allTokens = [ethToken, ...enrichedTokens];

            const totalUsdValue = allTokens.reduce((sum, t) => sum + t.usdValue, 0);
            // Weighted average 24h change
            const totalChange24h =
                totalUsdValue > 0
                    ? allTokens.reduce((sum, t) => sum + (t.priceChange24h * t.usdValue) / totalUsdValue, 0)
                    : 0;

            setWalletState((prev) => ({
                ...prev,
                ethBalance,
                chainId: chainInfo.chainId,
                chainName: chainInfo.chainName,
                tokens: allTokens,
                totalUsdValue,
                totalChange24h,
                error: null,
            }));
        } catch (error) {
            console.error('[WalletContext] Portfolio refresh error:', error);
            setWalletState((prev) => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to refresh portfolio',
            }));
        }
    }, [walletState.address]);

    const connectWallet = useCallback(async () => {
        setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }));

        try {
            const address = await connectMetaMask();
            const [ethBalance, chainInfo, rawTokens, ethPrice] = await Promise.all([
                getETHBalance(address),
                getChainInfo(),
                getTokenBalances(address),
                getETHPrice(),
            ]);

            const ethToken: Token = {
                symbol: 'ETH',
                name: 'Ethereum',
                contractAddress: null,
                balance: ethBalance,
                decimals: 18,
                usdPrice: ethPrice.usd,
                usdValue: parseFloat(ethBalance) * ethPrice.usd,
                priceChange24h: ethPrice.usd_24h_change,
                logoUrl: 'https://coin-images.coingecko.com/coins/images/279/small/ethereum.png',
                coingeckoId: 'ethereum',
            };

            const enrichedTokens = await enrichTokensWithPrices(rawTokens);
            const allTokens = [ethToken, ...enrichedTokens];
            const totalUsdValue = allTokens.reduce((sum, t) => sum + t.usdValue, 0);
            const totalChange24h =
                totalUsdValue > 0
                    ? allTokens.reduce((sum, t) => sum + (t.priceChange24h * t.usdValue) / totalUsdValue, 0)
                    : 0;

            setWalletState({
                address,
                isConnected: true,
                isConnecting: false,
                chainId: chainInfo.chainId,
                chainName: chainInfo.chainName,
                ethBalance,
                tokens: allTokens,
                totalUsdValue,
                totalChange24h,
                error: null,
            });

            // Persist address in localStorage
            localStorage.setItem('cryptomind_address', address);

            // Redirect to dashboard
            window.location.href = '/dashboard';
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to connect wallet';
            setWalletState((prev) => ({
                ...prev,
                isConnecting: false,
                error: message,
            }));
        }
    }, []);

    const disconnectWallet = useCallback(() => {
        localStorage.removeItem('cryptomind_address');
        setWalletState(initialState);
        window.location.href = '/';
    }, []);

    // Auto-reconnect on page load if previously connected
    useEffect(() => {
        const savedAddress = localStorage.getItem('cryptomind_address');
        if (savedAddress && isMetaMaskInstalled()) {
            // Check if MetaMask still has the account connected
            window.ethereum!.request({ method: 'eth_accounts' }).then((accounts) => {
                const accs = accounts as string[];
                if (accs.length > 0 && accs[0].toLowerCase() === savedAddress.toLowerCase()) {
                    // Re-connect silently
                    connectWallet().catch(() => {
                        localStorage.removeItem('cryptomind_address');
                    });
                } else {
                    localStorage.removeItem('cryptomind_address');
                }
            });
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Listen for MetaMask account / chain changes
    useEffect(() => {
        if (!isMetaMaskInstalled()) return;

        const handleAccountsChanged = (accounts: unknown) => {
            const accs = accounts as string[];
            if (accs.length === 0) {
                disconnectWallet();
            } else if (walletState.address && accs[0].toLowerCase() !== walletState.address.toLowerCase()) {
                connectWallet();
            }
        };

        const handleChainChanged = () => {
            window.location.reload();
        };

        window.ethereum!.on('accountsChanged', handleAccountsChanged);
        window.ethereum!.on('chainChanged', handleChainChanged);

        return () => {
            window.ethereum!.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum!.removeListener('chainChanged', handleChainChanged);
        };
    }, [walletState.address, connectWallet, disconnectWallet]);

    return (
        <WalletContext.Provider value={{ walletState, connectWallet, disconnectWallet, refreshPortfolio }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet(): WalletContextType {
    const ctx = useContext(WalletContext);
    if (!ctx) {
        throw new Error('useWallet must be used inside WalletProvider');
    }
    return ctx;
}
