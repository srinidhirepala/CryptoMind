// CryptoMind — All TypeScript Interfaces

export interface Token {
    symbol: string;
    name: string;
    contractAddress: string | null; // null for ETH
    balance: string; // raw balance as decimal string
    decimals: number;
    usdValue: number;
    usdPrice: number;
    priceChange24h: number; // percentage
    logoUrl?: string;
    coingeckoId?: string;
}

export interface Transaction {
    hash: string;
    from: string;
    to: string;
    value: string; // ETH value as decimal string
    timeStamp: string; // unix timestamp string
    gas: string;
    gasPrice: string;
    gasUsed: string;
    isError: string; // "0" = success, "1" = error
    input: string;
    functionName?: string;
    // AI-generated fields
    label?: string;
    type?: 'send' | 'receive' | 'swap' | 'contract' | 'unknown';
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isStreaming?: boolean;
}

export interface WalletState {
    address: string | null;
    isConnected: boolean;
    isConnecting: boolean;
    chainId: number | null;
    chainName: string | null;
    ethBalance: string | null;
    tokens: Token[];
    totalUsdValue: number;
    totalChange24h: number;
    error: string | null;
}

export interface Recommendation {
    id: string;
    protocol: string;
    asset: string;
    type: 'staking' | 'lending' | 'yield' | 'liquidity';
    apy: number;
    minAmount: string;
    riskLevel: 'Low' | 'Medium' | 'High';
    description: string;
    logoUrl?: string;
    url?: string;
    tags: string[];
}

export interface PortfolioSummary {
    totalUsdValue: number;
    change24hPercent: number;
    topHolding: string;
    topHoldingPercent: number;
    tokenCount: number;
}

export interface CoinGeckoPrice {
    usd: number;
    usd_24h_change: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
}

export interface EtherscanResponse {
    status: string;
    message: string;
    result: EtherscanTransaction[];
}

export interface EtherscanTransaction {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    nonce: string;
    blockHash: string;
    transactionIndex: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
    isError: string;
    txreceipt_status: string;
    input: string;
    contractAddress: string;
    cumulativeGasUsed: string;
    gasUsed: string;
    confirmations: string;
    functionName?: string;
}

export interface WalletContextType {
    walletState: WalletState;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    refreshPortfolio: () => Promise<void>;
}

export interface ChartDataPoint {
    name: string;
    value: number;
    color: string;
    percent: number;
}
