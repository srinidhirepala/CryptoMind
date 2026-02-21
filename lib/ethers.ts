'use client';

import { BrowserProvider, JsonRpcSigner, formatEther, formatUnits, Contract } from 'ethers';
import type { Token } from '@/types';

// ERC-20 minimal ABI for balance and metadata
const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function name() view returns (string)',
];

// Extended Ethereum window type
declare global {
    interface Window {
        ethereum?: {
            request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
            on: (event: string, handler: (...args: unknown[]) => void) => void;
            removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
            isMetaMask?: boolean;
        };
    }
}

/**
 * Returns whether MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && !!window.ethereum?.isMetaMask;
}

/**
 * Returns a BrowserProvider connected to MetaMask
 */
export function getProvider(): BrowserProvider {
    if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }
    return new BrowserProvider(window.ethereum!);
}

/**
 * Returns the current connected signer (requires MetaMask to be unlocked)
 */
export async function getSigner(): Promise<JsonRpcSigner> {
    const provider = getProvider();
    return await provider.getSigner();
}

/**
 * Returns the ETH balance for a given address as a formatted decimal string
 */
export async function getETHBalance(address: string): Promise<string> {
    try {
        const provider = getProvider();
        const balance = await provider.getBalance(address);
        return formatEther(balance);
    } catch (error) {
        console.error('Error fetching ETH balance:', error);
        return '0';
    }
}

/**
 * Returns the current chain ID and name
 */
export async function getChainInfo(): Promise<{ chainId: number; chainName: string }> {
    const provider = getProvider();
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    const chainNames: Record<number, string> = {
        1: 'Ethereum Mainnet',
        5: 'Goerli Testnet',
        11155111: 'Sepolia Testnet',
        137: 'Polygon Mainnet',
        80001: 'Mumbai Testnet',
        56: 'BNB Smart Chain',
        43114: 'Avalanche C-Chain',
        42161: 'Arbitrum One',
        10: 'Optimism',
        8453: 'Base',
    };

    return {
        chainId,
        chainName: chainNames[chainId] ?? `Chain ${chainId}`,
    };
}

/**
 * Connects MetaMask and returns the first account address
 */
export async function connectMetaMask(): Promise<string> {
    if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please visit metamask.io to install it.');
    }

    const accounts = (await window.ethereum!.request({
        method: 'eth_requestAccounts',
    })) as string[];

    if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
    }

    return accounts[0];
}

/**
 * Fetches ERC-20 token balances for known popular tokens.
 * In production, you'd use Alchemy or Moralis to auto-discover all tokens.
 * This uses a curated list of popular ERC-20 contract addresses for demo purposes.
 */
export async function getTokenBalances(address: string): Promise<Token[]> {
    // Popular ERC-20 tokens on Ethereum mainnet (contract address, coingeckoId)
    const knownTokens: Array<{
        address: string;
        symbol: string;
        name: string;
        coingeckoId: string;
        logoUrl: string;
    }> = [
            {
                address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                symbol: 'USDC',
                name: 'USD Coin',
                coingeckoId: 'usd-coin',
                logoUrl: 'https://coin-images.coingecko.com/coins/images/6319/small/usdc.png',
            },
            {
                address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                symbol: 'USDT',
                name: 'Tether USD',
                coingeckoId: 'tether',
                logoUrl: 'https://coin-images.coingecko.com/coins/images/325/small/Tether.png',
            },
            {
                address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
                symbol: 'WBTC',
                name: 'Wrapped Bitcoin',
                coingeckoId: 'wrapped-bitcoin',
                logoUrl: 'https://coin-images.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png',
            },
            {
                address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
                symbol: 'LINK',
                name: 'Chainlink',
                coingeckoId: 'chainlink',
                logoUrl: 'https://coin-images.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
            },
            {
                address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
                symbol: 'MATIC',
                name: 'Polygon',
                coingeckoId: 'matic-network',
                logoUrl: 'https://coin-images.coingecko.com/coins/images/4713/small/matic-token-icon.png',
            },
            {
                address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
                symbol: 'UNI',
                name: 'Uniswap',
                coingeckoId: 'uniswap',
                logoUrl: 'https://coin-images.coingecko.com/coins/images/12504/small/uniswap-logo.png',
            },
            {
                address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
                symbol: 'DAI',
                name: 'Dai Stablecoin',
                coingeckoId: 'dai',
                logoUrl: 'https://coin-images.coingecko.com/coins/images/9956/small/Badge_Dai.png',
            },
            {
                address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
                symbol: 'stETH',
                name: 'Lido Staked ETH',
                coingeckoId: 'staked-ether',
                logoUrl: 'https://coin-images.coingecko.com/coins/images/13442/small/steth_logo.png',
            },
        ];

    const provider = getProvider();
    const tokens: Token[] = [];

    for (const tokenInfo of knownTokens) {
        try {
            const contract = new Contract(tokenInfo.address, ERC20_ABI, provider);
            const rawBalance = await contract.balanceOf(address) as bigint;

            // Skip tokens with zero balance
            if (rawBalance === 0n) continue;

            const decimals = await contract.decimals() as number;
            const balance = formatUnits(rawBalance, decimals);

            tokens.push({
                symbol: tokenInfo.symbol,
                name: tokenInfo.name,
                contractAddress: tokenInfo.address,
                balance,
                decimals: Number(decimals),
                usdValue: 0, // Will be filled by price fetch
                usdPrice: 0,
                priceChange24h: 0,
                logoUrl: tokenInfo.logoUrl,
                coingeckoId: tokenInfo.coingeckoId,
            });
        } catch {
            // Token not found or error — skip it
            continue;
        }
    }

    return tokens;
}

/**
 * Gets a truncated wallet address for display: 0x1234...abcd
 */
export function truncateAddress(address: string, chars = 4): string {
    if (!address) return '';
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
