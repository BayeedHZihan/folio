import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useTransactions,
  useAddTransaction,
  useDeleteTransaction,
  type CreateTransactionRequest,
} from '../hooks/usePortfolio'

const schema = z.object({
  ticker: z.string().min(1, 'Required').max(10),
  type: z.enum(['BUY', 'SELL']),
  shares: z.coerce.number().positive('Must be positive'),
  pricePerShare: z.coerce.number().positive('Must be positive'),
  currency: z.string().length(3, 'Must be 3 characters'),
  date: z.string().min(1, 'Required'),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false)
  const { data: transactions, isLoading } = useTransactions()
  const addTransaction = useAddTransaction()
  const deleteTransaction = useDeleteTransaction()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      type: 'BUY',
      currency: 'EUR',
    },
  })

  const onSubmit = async (values: FormValues) => {
    const payload: CreateTransactionRequest = {
      ...values,
      ticker: values.ticker.toUpperCase(),
      date: new Date(values.date).toISOString(),
    }
    await addTransaction.mutateAsync(payload)
    reset()
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Transactions</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Transaction'}
        </button>
      </div>

      {/* Add Transaction Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Field label="Ticker" error={errors.ticker?.message}>
            <input
              {...register('ticker')}
              placeholder="AAPL"
              className={inputCls}
            />
          </Field>

          <Field label="Type" error={errors.type?.message}>
            <select {...register('type')} className={inputCls}>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </Field>

          <Field label="Shares" error={errors.shares?.message}>
            <input
              {...register('shares')}
              type="number"
              step="0.0001"
              placeholder="10"
              className={inputCls}
            />
          </Field>

          <Field label="Price per Share" error={errors.pricePerShare?.message}>
            <input
              {...register('pricePerShare')}
              type="number"
              step="0.01"
              placeholder="150.00"
              className={inputCls}
            />
          </Field>

          <Field label="Currency" error={errors.currency?.message}>
            <input
              {...register('currency')}
              placeholder="EUR"
              className={inputCls}
            />
          </Field>

          <Field label="Date" error={errors.date?.message}>
            <input
              {...register('date')}
              type="date"
              className={inputCls}
            />
          </Field>

          <Field label="Notes (optional)" error={errors.notes?.message}>
            <input
              {...register('notes')}
              placeholder="Optional note"
              className={inputCls}
            />
          </Field>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSubmitting || addTransaction.isPending}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {addTransaction.isPending ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      )}

      {/* Transactions Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : !transactions?.length ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-500 text-sm">No transactions yet. Add your first trade above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Date', 'Ticker', 'Type', 'Shares', 'Price', 'Total', 'Notes', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(tx.date).toLocaleDateString('de-DE')}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{tx.ticker}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        tx.type === 'BUY'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{tx.shares}</td>
                  <td className="px-4 py-3 text-gray-300">
                    €{tx.pricePerShare.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    €{(tx.shares * tx.pricePerShare).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{tx.notes ?? '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteTransaction.mutate(tx.id)}
                      disabled={deleteTransaction.isPending}
                      className="text-gray-600 hover:text-red-400 transition-colors text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const inputCls =
  'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600'

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}