# CryptoMind — AI Crypto Wallet Dashboard

> **HakTa Global Hackathon 2025** · Powered by GitHub Copilot · Built with Next.js 14

![CryptoMind Dashboard](./docs/screenshot.png)

## 🧠 What is CryptoMind?

CryptoMind is an AI-powered crypto wallet dashboard that connects to your MetaMask wallet and transforms raw blockchain data into clear, actionable insights. Think of it as **Google Pay meets an AI financial advisor** — but for crypto.

Connect your wallet → Get instant AI analysis → Chat with your crypto advisor → Earn smarter.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔗 **MetaMask Connection** | One-click connect, disconnect, address display |
| 📊 **Live Portfolio** | Real-time prices via CoinGecko API, pie chart breakdown |
| 🤖 **AI Summary** | GPT-4o-mini generates a 3–4 sentence portfolio analysis |
| 💬 **AI Chat Assistant** | Ask anything about your crypto — context-aware responses |
| 🔍 **Transaction History** | Last 10 txns with AI-generated plain-English labels |
| 💰 **Staking & Lending** | AI-matched DeFi opportunities with APY and risk ratings |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (custom dark theme)
- **Blockchain**: Ethers.js v6
- **AI**: OpenAI GPT-4o-mini (streaming responses)
- **Prices**: CoinGecko API (free, no key needed)
- **Transactions**: Etherscan API
- **Charts**: Recharts (pie chart)

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [MetaMask browser extension](https://metamask.io/)
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### 2. Clone & Install

```bash
git clone https://github.com/your-username/cryptomind.git
cd cryptomind
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your keys:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
ETHERSCAN_API_KEY=your-etherscan-api-key-here  # Optional but recommended
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Connect MetaMask

1. Click **"Connect MetaMask"** on the landing page
2. Approve the connection in your MetaMask popup
3. View your live portfolio on the dashboard!

---

## 📁 Project Structure

```
cryptomind/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Landing page with hero
│   ├── globals.css             # Global styles, animations
│   ├── dashboard/
│   │   └── page.tsx            # Full dashboard page
│   └── api/
│       ├── ai-summary/route.ts # Streaming portfolio summary
│       ├── ai-chat/route.ts    # Streaming chat with wallet context
│       └── transactions/route.ts # Etherscan + AI labeling
├── components/
│   ├── ConnectWallet.tsx       # MetaMask connect/disconnect
│   ├── PortfolioCard.tsx       # Token balance card
│   ├── PortfolioChart.tsx      # Recharts pie chart
│   ├── AISummary.tsx           # Streaming AI summary
│   ├── ChatAssistant.tsx       # Fixed right-side chat panel
│   ├── TransactionList.tsx     # AI-labeled tx history
│   └── RecommendationCard.tsx  # Staking/lending suggestions
├── context/
│   └── WalletContext.tsx       # Global MetaMask state + portfolio
├── lib/
│   ├── ethers.ts               # MetaMask, ETH & token balance fetch
│   ├── coingecko.ts            # Live price data with caching
│   ├── etherscan.ts            # Transaction history
│   └── utils.ts                # Format helpers, chart data
├── types/
│   └── index.ts                # TypeScript interfaces
└── .env.local.example          # Environment variable template
```

---

## 🤖 How GitHub Copilot Was Used

This project was built end-to-end with **GitHub Copilot** as the AI pair programmer:

1. **Architecture Design**: Copilot helped design the component hierarchy and data flow from MetaMask → Context → UI
2. **Ethers.js Integration**: Copilot generated the full `lib/ethers.ts` library including ERC-20 ABI, token balance fetching, and MetaMask event listeners
3. **Streaming AI Responses**: Copilot implemented the `ReadableStream` pattern for real-time token streaming from OpenAI's API
4. **Complex Components**: The `ChatAssistant` with streaming state management and `PortfolioChart` with custom tooltips were co-written with Copilot
5. **Error Handling**: Copilot suggested comprehensive error boundaries, loading skeletons, and retry logic throughout
6. **TypeScript Types**: All interfaces in `types/index.ts` were generated and refined with Copilot's suggestions

---

## 🔐 Security Notes

- All API keys are server-side only (Next.js API routes) — never exposed to the client
- No wallet data is stored server-side — everything is read-only
- MetaMask never shares private keys — only public address and balance are read

---

## 📸 Demo Screenshots

| Landing Page | Dashboard | Chat Assistant |
|:---:|:---:|:---:|
| *Add screenshot here* | *Add screenshot here* | *Add screenshot here* |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built for HakTa Global Hackathon 2025 · "This is not financial advice" — CryptoMind AI*
