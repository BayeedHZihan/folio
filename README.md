# Folio — Portfolio Analytics

A full-stack portfolio analytics web app that replicates paid features from brokers like Scalable Capital. Built as a portfolio project to demonstrate modern React and Node.js development practices.

![Folio Dashboard](https://placehold.co/1200x630/111827/22c55e?text=Folio+Dashboard)

## What it does

- Track your stock transactions (buy/sell)
- See your portfolio value and gain/loss in real time
- Visualise your allocation by holding, sector, and region
- Prices fetched from Finnhub and converted to EUR automatically

## Project Structure
```
folio/
├── client/       # React + Vite frontend
└── server/       # Express + Prisma backend
```

See [client/README.md](./client/README.md) and [server/README.md](./server/README.md) for detailed setup instructions.

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm
- PostgreSQL

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/folio.git
cd folio
```

### 2. Set up the server
```bash
cd server
pnpm install
cp .env.example .env
# Edit .env with your database URL, JWT secret and Finnhub API key
pnpm dlx prisma migrate dev
pnpm dev
```

### 3. Set up the client
```bash
cd client
pnpm install
pnpm dev
```

- Client: `http://localhost:5173`
- Server: `http://localhost:3001`

## Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS v4 | Styling |
| TanStack Query | Server state and caching |
| React Router v6 | Routing |
| React Hook Form + Zod | Forms and validation |
| Recharts | Charts |
| Zustand | Auth state |

### Backend
| Tool | Purpose |
|---|---|
| Express + TypeScript | HTTP server |
| Prisma v7 | ORM |
| PostgreSQL | Database |
| Finnhub API | Stock price data |
| ExchangeRate-API | EUR/USD forex rate |
| node-cron | Scheduled price polling |

## Interesting Engineering Decisions

**EUR-only storage** — Finnhub returns all prices in USD. Rather than converting on the fly in the frontend, prices are converted to EUR in the backend before being stored. This keeps all calculations simple and consistent — the frontend never has to think about currencies.

**Optimistic deletes** — deleting a transaction removes it from the UI instantly before the server confirms. If the server fails it rolls back automatically using React Query's `onMutate` and `onError` hooks.

**Custom fetch wrapper** — instead of adding Axios as a dependency, a thin wrapper around native `fetch` handles auth token injection and 401 redirects automatically.

**Pure portfolio service** — `portfolioService.ts` on the server contains only pure functions with no database calls. Takes raw transactions in, returns calculated holdings and analytics out. Fully unit testable in isolation.

**Stock price caching** — prices are cached in PostgreSQL for 30 minutes. A cron job refreshes all tracked tickers every 20 minutes during market hours only (weekdays 08:00–22:00 UTC) to stay within Finnhub's free tier limits.

## Roadmap

- [ ] Holdings table on dashboard
- [ ] Ticker autocomplete on transaction form
- [ ] What-if investment simulator
- [ ] Historical performance chart
- [ ] Mobile responsive polish