# Folio — Server

Express backend for Folio, a portfolio analytics web app.

## Stack

| Tool | Purpose |
|---|---|
| Express + TypeScript | HTTP server |
| Prisma v7 | ORM and migrations |
| PostgreSQL | Database |
| Zod | Request validation |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT auth |
| node-cron | Scheduled jobs |
| Finnhub API | Stock price data |
| ExchangeRate-API | EUR/USD forex rate |

## Structure
```
src/
├── jobs/               # Cron jobs (price poller, forex poller)
├── lib/                # Prisma client singleton
├── middleware/         # Auth middleware, error handler
├── routes/             # Express route handlers
├── services/           # Business logic (stock, portfolio)
└── types/              # Shared TypeScript types
prisma/
├── schema.prisma       # Database schema
└── migrations/         # Migration history
```

## Getting Started
```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL, JWT secret, and Finnhub API key

# Run database migrations
pnpm dlx prisma migrate dev

# Start dev server
pnpm dev
```

Server runs on `http://localhost:3001`.

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `PORT` | Server port (default: 3001) |
| `FINNHUB_API_KEY` | Finnhub API key (free tier) |
| `NODE_ENV` | `development` or `production` |

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | ✓ | Current user |
| GET | `/api/transactions` | ✓ | List transactions |
| POST | `/api/transactions` | ✓ | Add transaction |
| DELETE | `/api/transactions/:id` | ✓ | Delete transaction |
| GET | `/api/portfolio/summary` | ✓ | Holdings and P&L |
| GET | `/api/portfolio/analytics` | ✓ | Allocation breakdowns |
| GET | `/api/stocks/search?q=` | ✓ | Ticker autocomplete |

## Key Design Decisions

**EUR-only storage** — all stock prices are fetched from Finnhub in USD and converted to EUR before being stored. The EUR/USD rate is fetched from ExchangeRate-API (ECB sourced) and cached in the DB for one hour.

**Stock price caching** — prices are cached for 30 minutes. A cron job refreshes all tracked stocks every 20 minutes during market hours (08:00–22:00 UTC, weekdays only).

**Pure portfolio service** — `portfolioService.ts` contains only pure functions with no DB calls. Takes transactions in, returns calculated holdings and analytics out. Easy to unit test.

**Zod validation on all endpoints** — every POST request is validated with a Zod schema before touching the database. Invalid requests get a clean error response.

**Optimistic stock upsert** — when a user adds a transaction for a new ticker, the stock is immediately fetched from Finnhub and upserted into the DB before the transaction is created, satisfying the foreign key constraint.