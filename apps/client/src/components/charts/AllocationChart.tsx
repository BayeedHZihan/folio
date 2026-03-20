import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { AllocationSlice } from '../../hooks/usePortfolio'

const COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ec4899',
  '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
  '#6b7280',
]

interface Props {
  title: string
  data: AllocationSlice[]
}

export default function AllocationChart({ title, data }: Props) {
  if (!data.length) return null

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-4">{title} Allocation</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            nameKey="label"
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any, name: any) => [
              `${Number(value).toFixed(1)}%`,
              String(name),
            ]}
            contentStyle={{
              background: '#111827',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f9fafb',
            }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}