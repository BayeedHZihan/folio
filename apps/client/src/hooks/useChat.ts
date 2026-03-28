import { useState } from 'react'
import { api } from '../lib/api'

export interface ChatMessage {
  role: 'user' | 'model'
  content: string
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = async (content: string) => {
    const userMessage: ChatMessage = { role: 'user', content }
    const updatedMessages = [...messages, userMessage]

    // Optimistically add user message to UI immediately
    setMessages(updatedMessages)
    setIsLoading(true)
    setError(null)

    try {
      const res = await api.post<{ success: true; data: { message: string } }>(
        '/ai/chat',
        { messages: updatedMessages }
      )

      const modelMessage: ChatMessage = {
        role: 'model',
        content: res.data.message,
      }

      setMessages((prev) => [...prev, modelMessage])
    } catch (err: any) {
      setError(err.message ?? 'Failed to get response')
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  return { messages, isLoading, error, sendMessage, clearChat }
}