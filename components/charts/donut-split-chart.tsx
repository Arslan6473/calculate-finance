'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { formatCurrency, type CurrencyCode } from '@/lib/formatting/currency'
import { ChartContainer, toChartNumber } from './chart-container'

export interface DonutSlice {
  label: string
  value: number
  color: string
}

interface DonutSplitChartProps {
  title: string
  slices: DonutSlice[]
  currency: CurrencyCode
}

/** Two- or three-slice donut for a total split into parts — principal vs interest, buy vs rent. */
export function DonutSplitChart({ title, slices, currency }: DonutSplitChartProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0)
  const summary =
    total > 0
      ? slices
          .map((s) => `${s.label}: ${formatCurrency(s.value, currency)} (${Math.round((s.value / total) * 100)}%)`)
          .join('. ')
      : 'No data to display yet.'

  return (
    <div>
      <ChartContainer title={title} summary={summary}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              innerRadius="60%"
              outerRadius="90%"
              paddingAngle={2}
              isAnimationActive={false}
            >
              {slices.map((slice) => (
                <Cell key={slice.label} fill={slice.color} stroke="var(--surface)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [formatCurrency(toChartNumber(value), currency), String(name)]}
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 8,
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
      <div className="mt-3 flex flex-wrap justify-center gap-4">
        {slices.map((slice) => (
          <div key={slice.label} className="flex items-center gap-2 text-xs text-ink-muted">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
            {slice.label}
          </div>
        ))}
      </div>
    </div>
  )
}
