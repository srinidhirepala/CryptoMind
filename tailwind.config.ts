import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                navy: {
                    950: '#030712',
                    900: '#0a0f1e',
                    800: '#0d1428',
                    700: '#111827',
                    600: '#1a2540',
                    500: '#1e2d50',
                    400: '#243460',
                },
                brand: {
                    DEFAULT: '#3b82f6',
                    50: '#eff6ff',
                    100: '#dbeafe',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                },
                accent: {
                    cyan: '#06b6d4',
                    purple: '#8b5cf6',
                    emerald: '#10b981',
                    amber: '#f59e0b',
                    rose: '#f43f5e',
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-hero': 'linear-gradient(135deg, #030712 0%, #0d1428 40%, #111827 100%)',
                'gradient-card': 'linear-gradient(135deg, rgba(30,45,80,0.6) 0%, rgba(13,20,40,0.8) 100%)',
                'gradient-brand': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-mono)', 'monospace'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'spin-slow': 'spin 8s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
                    '100%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.7)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'card': '0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset',
                'glow-blue': '0 0 30px rgba(59, 130, 246, 0.3)',
                'glow-purple': '0 0 30px rgba(139, 92, 246, 0.3)',
                'glow-cyan': '0 0 30px rgba(6, 182, 212, 0.3)',
            },
        },
    },
    plugins: [],
};

export default config;
