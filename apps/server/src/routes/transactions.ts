import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, type AuthRequest } from '../middleware/authenticate';
import { fetchAndUpsertStock } from '../services/stockService';

export const transactionsRouter = Router();
transactionsRouter.use(authenticate);

const createTransactionSchema = z.object({
  ticker: z.string().min(1).max(10).toUpperCase(),
  type: z.enum(['BUY', 'SELL']),
  shares: z.number().positive(),
  pricePerShare: z.number().positive(),
  currency: z.string().length(3),
  date: z.string().datetime(),
  notes: z.string().optional(),
});

// GET /api/transactions
transactionsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.userId! },
      orderBy: { date: 'desc' },
    });
    res.json({ success: true, data: transactions });
  } catch (err) {
    next(err);
  }
});

// POST /api/transactions
transactionsRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const body = createTransactionSchema.parse(req.body);

    await fetchAndUpsertStock(body.ticker);

    const transaction = await prisma.transaction.create({
      data: { ...body, userId: req.userId!, date: new Date(body.date) },
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/transactions/:id
transactionsRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const transaction = await prisma.transaction.findUnique({ where: { id: req.params.id } });
    if (!transaction || transaction.userId !== req.userId) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Transaction not found' } });
      return;
    }
    await prisma.transaction.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
});