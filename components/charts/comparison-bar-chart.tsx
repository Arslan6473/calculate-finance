'use client'

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { formatCurrency, type CurrencyCode } from '@/lib/formatting/currency'
import { ChartContainer, toChartNumber } from './chart-container'

export interface ComparisonBar {
  label: string
  value: number
  color: string
}

interface ComparisonBarChartProps {
  title: string
  bars: ComparisonBar[]
  currency: CurrencyCode
}

/** Side-by-side totals for two options — snowball vs avalanche, buy vs rent. */
export function ComparisonBarChart({ title, bars, currency }: ComparisonBarChartProps) {
  const summary = bars.map((b) => `${b.label}: ${formatCurrency(b.value, currency)}.`).join(' ')

  return (
    <ChartContainer title={title} summary={summary} height={200}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bars} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: 'var(--ink-subtle)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--line)' }}
            tickFormatter={(v) => formatCurrency(v, currency, { compact: true })}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 12, fill: 'var(--ink)' }}
            tickLine={false}
            axisLine={false}
            width={110}
          />
          <Tooltip
            formatter={(value) => formatCurrency(toChartNumber(value), currency)}
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 8,
              fontSize: 13,
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {bars.map((bar) => (
              <Cell key={bar.label} fill={bar.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
