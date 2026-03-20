import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, type AuthRequest } from '../middleware/authenticate';
import { buildPortfolioSummary, buildPortfolioAnalytics } from '../services/portfolioService';

export const portfolioRouter = Router();
portfolioRouter.use(authenticate);

// GET /api/portfolio/summary
portfolioRouter.get('/summary', async (req: AuthRequest, res, next) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.userId! },
      include: { stock: true },
    });
    const summary = buildPortfolioSummary(transactions);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

// GET /api/portfolio/analytics
portfolioRouter.get('/analytics', async (req: AuthRequest, res, next) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.userId! },
      include: { stock: true },
    });
    const summary = buildPortfolioSummary(transactions);
    const analytics = buildPortfolioAnalytics(summary.holdings);
    res.json({ success: true, data: analytics });
  } catch (err) {
    next(err);
  }
});