import { usePortfolioSummary, usePortfolioAnalytics } from '../hooks/usePortfolio'
import AllocationChart from '../components/charts/AllocationChart'

export default function DashboardPage() {
  const summary = usePortfolioSummary()
  const analytics = usePortfolioAnalytics()

  const isLoading = summary.isLoading || analytics.isLoading
  const isError = summary.isError || analytics.isError

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-800 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-72 rounded-xl bg-gray-800 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400 text-sm">Failed to load portfolio data. Please try again.</p>
      </div>
    )
  }

  const { totalValue, totalGainLoss, totalGainLossPercent, totalCost, holdings } = summary.data!
  const { holdingAllocation, sectorAllocation, regionAllocation } = analytics.data!
  const isPositive = totalGainLoss >= 0

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Total Value"
          value={`€${totalValue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <KpiCard
          label="Total Invested"
          value={`€${totalCost.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <KpiCard
          label="Gain / Loss"
          value={`${isPositive ? '+' : ''}€${totalGainLoss.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          valueClassName={isPositive ? 'text-green-400' : 'text-red-400'}
        />
        <KpiCard
          label="Return"
          value={`${isPositive ? '+' : ''}${totalGainLossPercent.toFixed(2)}%`}
          valueClassName={isPositive ? 'text-green-400' : 'text-red-400'}
        />
      </div>

      {/* Empty state */}
      {holdings.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-400 text-lg mb-2">No holdings yet</p>
          <p className="text-gray-600 text-sm">Add your first transaction to see your portfolio analytics.</p>
        </div>
      )}

      {/* Charts */}
      {holdings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AllocationChart title="Holdings" data={holdingAllocation} />
          <AllocationChart title="Sectors" data={sectorAllocation} />
          <AllocationChart title="Regions" data={regionAllocation} />
        </div>
      )}
    </div>
  )
}

function KpiCard({
  label,
  value,
  valueClassName = 'text-white',
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
      <p className="text-xs text-gray-500 mb-2">{label}</p>
      <p className={`text-2xl font-semibold ${valueClassName}`}>{value}</p>
    </div>
  )
}