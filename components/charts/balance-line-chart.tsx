'use client'

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { formatCurrency, type CurrencyCode } from '@/lib/formatting/currency'
import { ChartContainer, toChartNumber } from './chart-container'

export interface BalanceSeries {
  name: string
  color: string
  points: Array<{ x: number; y: number }>
}

interface BalanceLineChartProps {
  title: string
  xLabel: string
  series: BalanceSeries[]
  currency: CurrencyCode
}

/** One or more balances declining (or comparing) over time — mortgages, debt payoff, credit cards. */
export function BalanceLineChart({ title, xLabel, series, currency }: BalanceLineChartProps) {
  const xValues = series[0]?.points.map((p) => p.x) ?? []
  const merged = xValues.map((x, i) => {
    const row: Record<string, number> = { x }
    for (const s of series) row[s.name] = s.points[i]?.y ?? 0
    return row
  })

  const summary =
    series.length > 0 && series[0].points.length > 0
      ? series
          .map((s) => {
            const first = s.points[0].y
            const last = s.points[s.points.length - 1].y
            return `${s.name} goes from ${formatCurrency(first, currency)} to ${formatCurrency(last, currency)}.`
          })
          .join(' ')
      : 'No data to display yet.'

  return (
    <ChartContainer title={title} summary={summary}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={merged} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s) => (
            <Line
              key={s.name}
              type="monotone"
              dataKey={s.name}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
