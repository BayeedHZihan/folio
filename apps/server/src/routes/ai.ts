import { Router } from 'express'
import { z } from 'zod'
import { authenticate, type AuthRequest } from '../middleware/authenticate'
import { prisma } from '../lib/prisma'
import { buildPortfolioSummary } from '../services/portfolioService'
import { chatWithPortfolio } from '../services/aiService'

export const aiRouter = Router()
aiRouter.use(authenticate)

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.string().min(1),
    })
  ).min(1),
})

// POST /api/ai/chat
aiRouter.post('/chat', async (req: AuthRequest, res, next) => {
  try {
    const { messages } = chatSchema.parse(req.body)

    // Fetch user's transactions with stock data
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.userId! },
      include: { stock: true },
    })

    if (transactions.length === 0) {
      res.json({
        success: true,
        data: {
          message: "You don't have any transactions yet. Add some trades first and I can analyse your portfolio!"
        }
      })
      return
    }

    // Build portfolio summary from transactions
    const portfolio = buildPortfolioSummary(transactions)

    // Send to Gemini with portfolio context
    const response = await chatWithPortfolio(portfolio, messages)

    res.json({ success: true, data: { message: response } })
  } catch (err) {
    next(err)
  }
})