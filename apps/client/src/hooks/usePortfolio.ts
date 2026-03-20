import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PortfolioHolding {
  ticker: string
  name: string
  shares: number
  averageCostBasis: number
  currentPrice: number
  currentValue: number
  totalCost: number
  gainLoss: number
  gainLossPercent: number
  weight: number
  sector: string
  region: string
  currency: string
}

export interface PortfolioSummary {
  totalValue: number
  totalCost: number
  totalGainLoss: number
  totalGainLossPercent: number
  holdings: PortfolioHolding[]
  lastUpdated: string
}

export interface AllocationSlice {
  label: string
  value: number
  absoluteValue: number
}

export interface PortfolioAnalytics {
  holdingAllocation: AllocationSlice[]
  sectorAllocation: AllocationSlice[]
  regionAllocation: AllocationSlice[]
}

export interface Transaction {
  id: string
  userId: string
  ticker: string
  type: 'BUY' | 'SELL'
  shares: number
  pricePerShare: number
  currency: string
  date: string
  notes?: string
  createdAt: string
}

export interface CreateTransactionRequest {
  ticker: string
  type: 'BUY' | 'SELL'
  shares: number
  pricePerShare: number
  currency: string
  date: string
  notes?: string
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const queryKeys = {
  portfolioSummary: ['portfolio', 'summary'] as const,
  portfolioAnalytics: ['portfolio', 'analytics'] as const,
  transactions: ['transactions'] as const,
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function usePortfolioSummary() {
  return useQuery({
    queryKey: queryKeys.portfolioSummary,
    queryFn: () =>
      api.get<{ success: true; data: PortfolioSummary }>('/portfolio/summary').then((r) => r.data),
  })
}

export function usePortfolioAnalytics() {
  return useQuery({
    queryKey: queryKeys.portfolioAnalytics,
    queryFn: () =>
      api.get<{ success: true; data: PortfolioAnalytics }>('/portfolio/analytics').then((r) => r.data),
  })
}

export function useTransactions() {
  return useQuery({
    queryKey: queryKeys.transactions,
    queryFn: () =>
      api.get<{ success: true; data: Transaction[] }>('/transactions').then((r) => r.data),
  })
}

export function useAddTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTransactionRequest) =>
      api.post<{ success: true; data: Transaction }>('/transactions', payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions })
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolioSummary })
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolioAnalytics })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ success: true }>(`/transactions/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.transactions })
      const previous = queryClient.getQueryData<Transaction[]>(queryKeys.transactions)
      queryClient.setQueryData<Transaction[]>(
        queryKeys.transactions,
        (old) => old?.filter((t) => t.id !== id) ?? []
      )
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.transactions, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions })
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolioSummary })
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolioAnalytics })
    },
  })
}