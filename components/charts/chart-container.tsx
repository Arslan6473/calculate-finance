import * as React from 'react'

interface ChartContainerProps {
  title: string
  /** Plain-language summary of what the chart shows, for screen readers and as a fallback. */
  summary: string
  height?: number
  children: React.ReactNode
}

/**
 * Wraps every chart with a title and an accessible text summary (brief §25:
 * "no color-only information," accessible charts). The SVG itself is marked
 * decorative via `role="img"` + `aria-label` on the summary; screen reader
 * users get the same information a sighted user gets from the shape of the
 * chart, just in words.
 */
/** Recharts' tooltip formatter passes `ValueType | undefined`; coerces it back to a plain number. */
export function toChartNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (Array.isArray(value)) return toChartNumber(value[0])
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function ChartContainer({ title, summary, height = 260, children }: ChartContainerProps) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-ink">{title}</h3>
      <div role="img" aria-label={summary} style={{ height }}>
        {children}
      </div>
      <p className="sr-only">{summary}</p>
    </div>
  )
}
