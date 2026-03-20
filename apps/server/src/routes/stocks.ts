import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/authenticate';

export const stocksRouter = Router();
stocksRouter.use(authenticate);

// GET /api/stocks/search?q=AAPL
stocksRouter.get('/search', async (req, res, next) => {
  try {
    const q = String(req.query.q ?? '').toUpperCase();
    if (!q) {
      res.json({ success: true, data: [] });
      return;
    }
    const stocks = await prisma.stock.findMany({
      where: {
        OR: [
          { ticker: { startsWith: q } },
          { name: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 10,
    });
    res.json({ success: true, data: stocks });
  } catch (err) {
    next(err);
  }
});