import { GoogleGenerativeAI } from '@google/generative-ai'
import type { PortfolioSummary } from '../types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// We use gemini-2.5-flash — it's on the free tier and fast enough for chat
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

function buildSystemPrompt(portfolio: PortfolioSummary): string {
  const holdings = portfolio.holdings
    .map(
      (h) =>
        `- ${h.name} (${h.ticker}): ${h.shares} shares, current value €${h.currentValue.toFixed(2)}, gain/loss ${h.gainLossPercent.toFixed(2)}%, sector: ${h.sector}, region: ${h.region}`
    )
    .join('\n')

  return `You are a helpful portfolio analyst assistant. The user is asking questions about their investment portfolio.

Here is their current portfolio data:

Total Value: €${portfolio.totalValue.toFixed(2)}
Total Invested: €${portfolio.totalCost.toFixed(2)}
Total Gain/Loss: €${portfolio.totalGainLoss.toFixed(2)} (${portfolio.totalGainLossPercent.toFixed(2)}%)

Holdings:
${holdings}

Guidelines:
- Answer questions about their portfolio clearly and concisely
- Point out concentration risks if relevant
- Keep responses short and to the point
- Always refer to values in EUR`
}

export async function chatWithPortfolio(
  portfolio: PortfolioSummary,
  messages: { role: 'user' | 'model'; content: string }[]
): Promise<string> {
  const systemPrompt = buildSystemPrompt(portfolio)

  // Gemini handles conversation history as an array of messages
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }))

  const chat = model.startChat({
    history,
    systemInstruction: {
        role: 'user',
        parts: [{ text: systemPrompt }],
    },
  })

  // The last message is the current user message
  const lastMessage = messages[messages.length - 1]
  const result = await chat.sendMessage(lastMessage.content)
  return result.response.text()
}