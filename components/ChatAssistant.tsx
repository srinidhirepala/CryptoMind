'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useWallet } from '@/context/WalletContext';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types';

const SUGGESTED_QUESTIONS = [
    'Should I stake my ETH?',
    'Is my portfolio diversified?',
    'What is the riskiest token I hold?',
    'Explain DeFi lending to me',
    'What should I do with my crypto?',
];

function generateId(): string {
    return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === 'user';
    return (
        <div className={cn('flex gap-3 group', isUser ? 'flex-row-reverse' : 'flex-row')}>
            {/* Avatar */}
            <div
                className={cn(
                    'w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold self-end',
                    isUser
                        ? 'bg-gradient-brand text-white'
                        : 'bg-violet-600/30 border border-violet-500/30 text-violet-300'
                )}
            >
                {isUser ? 'You' : '🤖'}
            </div>

            {/* Bubble */}
            <div
                className={cn(
                    'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                    isUser
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-navy-700 border border-slate-700/50 text-slate-200 rounded-bl-sm'
                )}
            >
                {message.content}
                {message.isStreaming && (
                    <span className="inline-flex gap-1 ml-1">
                        {[0, 1, 2].map((i) => (
                            <span
                                key={i}
                                className="loader-dot w-1.5 h-1.5 rounded-full bg-current inline-block opacity-60"
                                style={{ animationDelay: `${i * -0.16}s` }}
                            />
                        ))}
                    </span>
                )}
            </div>
        </div>
    );
}

export default function ChatAssistant() {
    const { walletState } = useWallet();
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content:
                "Hi! I'm your AI crypto advisor. I have full context of your wallet. Ask me anything — from \"Should I stake my ETH?\" to \"What's DeFi?\" 🚀",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = useCallback(
        async (content: string) => {
            if (!content.trim() || isLoading) return;

            const userMessage: ChatMessage = {
                id: generateId(),
                role: 'user',
                content: content.trim(),
                timestamp: new Date(),
            };

            const assistantMessage: ChatMessage = {
                id: generateId(),
                role: 'assistant',
                content: '',
                timestamp: new Date(),
                isStreaming: true,
            };

            setMessages((prev) => [...prev, userMessage, assistantMessage]);
            setInput('');
            setIsLoading(true);

            try {
                const walletContext = walletState.isConnected
                    ? {
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
                    }
                    : null;

                const historyForAPI = messages.slice(-10).map((m) => ({
                    role: m.role,
                    content: m.content,
                }));
                historyForAPI.push({ role: 'user', content: content.trim() });

                const response = await fetch('/api/ai-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: historyForAPI, walletContext }),
                });

                if (!response.ok) {
                    throw new Error('Chat request failed');
                }

                if (!response.body) throw new Error('No stream');

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let accumulated = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    accumulated += chunk;

                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === assistantMessage.id ? { ...m, content: accumulated } : m
                        )
                    );
                }

                // Mark streaming done
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantMessage.id ? { ...m, isStreaming: false } : m
                    )
                );
            } catch (error) {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantMessage.id
                            ? {
                                ...m,
                                content: 'Sorry, I encountered an error. Please try again.',
                                isStreaming: false,
                            }
                            : m
                    )
                );
            } finally {
                setIsLoading(false);
                inputRef.current?.focus();
            }
        },
        [messages, walletState, isLoading]
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <div
            className={cn(
                'fixed right-4 bottom-4 z-40 flex flex-col glass-card border border-slate-700/50 shadow-card transition-all duration-300',
                isOpen ? 'w-[360px] h-[600px]' : 'w-[200px] h-[52px]'
            )}
            id="chat-panel"
        >
            {/* Header */}
            <button
                onClick={() => setIsOpen((o) => !o)}
                className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/50 hover:bg-white/5 transition-colors rounded-t-2xl w-full text-left"
                aria-expanded={isOpen}
            >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-base">🤖</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white leading-none">AI Assistant</p>
                    {isOpen && <p className="text-xs text-emerald-400 mt-0.5">● Online</p>}
                </div>
                <svg
                    className={cn('w-4 h-4 text-slate-400 transition-transform flex-shrink-0', isOpen ? '' : 'rotate-180')}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
                        aria-label="Chat messages"
                    >
                        {messages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} />
                        ))}
                    </div>

                    {/* Suggested questions */}
                    {messages.length <= 2 && (
                        <div className="px-4 pb-3">
                            <p className="text-xs text-slate-600 mb-2 font-medium">Suggested questions</p>
                            <div className="flex flex-wrap gap-1.5">
                                {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => sendMessage(q)}
                                        className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Disclaimer */}
                    <div className="px-4 py-2 border-t border-slate-800/50">
                        <p className="text-xs text-slate-600 text-center">⚠️ Not financial advice</p>
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="px-3 pb-3">
                        <div className="flex items-center gap-2 bg-navy-800 border border-slate-700/50 rounded-xl px-3 py-2 focus-within:border-blue-500/50 transition-colors">
                            <input
                                ref={inputRef}
                                id="chat-input"
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your crypto..."
                                disabled={isLoading}
                                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none disabled:opacity-50"
                                autoComplete="off"
                            />
                            <button
                                type="submit"
                                id="chat-send-btn"
                                disabled={!input.trim() || isLoading}
                                className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                                aria-label="Send message"
                            >
                                {isLoading ? (
                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}
