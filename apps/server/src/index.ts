import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { stocksRouter } from './routes/stocks';
import { transactionsRouter } from './routes/transactions';
import { portfolioRouter } from './routes/portfolio';
import { errorHandler } from './middleware/errorHandler';
import { startPricePollingJob } from './jobs/pricePoller';
import { aiRouter } from './routes/ai';

const app = express();
const PORT = process.env.PORT ?? 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.CLIENT_URL ?? '',
  ],
  credentials: true,
}))
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/stocks', stocksRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/ai', aiRouter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error handler (must be last) ─────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  startPricePollingJob();
});