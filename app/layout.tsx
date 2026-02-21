import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/context/WalletContext';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'CryptoMind — AI Crypto Wallet Dashboard',
    description:
        'Connect your MetaMask wallet and get AI-powered insights, portfolio analysis, and personalized DeFi recommendations. Built for the HakTa Global Hackathon 2025.',
    keywords: ['crypto', 'wallet', 'AI', 'DeFi', 'MetaMask', 'portfolio', 'blockchain', 'Ethereum'],
    authors: [{ name: 'CryptoMind Team' }],
    openGraph: {
        title: 'CryptoMind — AI Crypto Wallet Dashboard',
        description: 'Your AI-powered crypto financial advisor. Connect MetaMask and get instant insights.',
        type: 'website',
    },
    icons: {
        icon: '/favicon.ico',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#030712',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} dark`}>
            <body className="min-h-screen bg-navy-950 text-slate-100 antialiased">
                <WalletProvider>{children}</WalletProvider>
            </body>
        </html>
    );
}
