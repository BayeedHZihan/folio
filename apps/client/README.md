# Folio — Client

React frontend for Folio, a portfolio analytics web app.

## Stack

| Tool | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool and dev server |
| Tailwind CSS v4 | Styling |
| TanStack Query | Server state, caching, mutations |
| React Router v6 | Client-side routing |
| React Hook Form + Zod | Form handling and validation |
| Recharts | Portfolio allocation charts |
| Zustand | Global auth state |

## Structure
```
src/
├── components/
│   ├── charts/         # Recharts chart components
│   ├── layout/         # AppLayout with navbar
│   └── ui/             # Reusable UI components
├── hooks/              # React Query hooks and types
├── lib/                # API fetch wrapper
├── pages/              # Route-level page components
└── store/              # Zustand auth store
```

## Getting Started
```bash
pnpm install
pnpm dev
```

App runs on `http://localhost:5173`. API requests are proxied to `http://localhost:3001` via Vite's proxy config so no CORS issues in development.

## Key Design Decisions

**Custom fetch wrapper over Axios** — `src/lib/api.ts` is a thin wrapper around native `fetch` that handles auth token injection and 401 redirects automatically. Keeps the dependency count low.

**React Query for all server state** — no useState/useEffect for data fetching anywhere. All API calls go through custom hooks in `src/hooks/usePortfolio.ts` which handle caching, loading states, and cache invalidation.

**Optimistic deletes** — deleting a transaction removes it from the UI instantly before the server confirms. If the server fails it rolls back automatically.

**Zustand for auth only** — global state is limited to the authenticated user and token. Everything else is either React Query cache or local component state.

## Pages

| Route | Page | Auth |
|---|---|---|
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/` | DashboardPage | Protected |
| `/transactions` | TransactionsPage | Protected |