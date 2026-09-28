'use client'

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { formatCurrency, type CurrencyCode } from '@/lib/formatting/currency'
import { ChartContainer, toChartNumber } from './chart-container'

export interface GrowthPoint {
  /** X-axis label — a year number or age. */
  x: number
  contributed: number
  growth: number
}

interface StackedGrowthChartProps {
  title: string
  xLabel: string
  data: GrowthPoint[]
  currency: CurrencyCode
}

/** Contributions vs growth, stacked over time — used by investment, retirement, and compound-interest calculators. */
export function StackedGrowthChart({ title, xLabel, data, currency }: StackedGrowthChartProps) {
  const last = data[data.length - 1]
  const summary = last
    ? `Over ${data.length} ${xLabel.toLowerCase()}s, contributions grow to ${formatCurrency(last.contributed, currency)} and investment growth adds ${formatCurrency(last.growth, currency)}, for a total of ${formatCurrency(last.contributed + last.growth, currency)}.`
    : 'No data to display yet.'

  return (
    <ChartContainer title={title} summary={summary}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
          <XAxis
            dataKey="x"
            tick={{ fontSize: 12, fill: 'var(--ink-subtle)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--line)' }}
            label={{ value: xLabel, position: 'insideBottom', offset: -4, fontSize: 11, fill: 'var(--ink-subtle)' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--ink-subtle)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCurrency(v, currency, { compact: true })}
            width={64}
          />
          <Tooltip
            formatter={(value, name) => [formatCurrency(toChartNumber(value), currency), String(name)]}
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 8,
              fontSize: 13,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="contributed"
            name="Contributed"
            stackId="1"
            stroke="var(--series-1)"
            fill="var(--series-1)"
            fillOpacity={0.25}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="growth"
            name="Growth"
            stackId="1"
            stroke="var(--series-3)"
            fill="var(--series-3)"
            fillOpacity={0.35}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
