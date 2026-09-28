import type * as React from 'react'

import { Card, CardContent } from '@/components/ui/card'

interface CalculatorShellProps {
  form: React.ReactNode
  results: React.ReactNode
  /** The single headline figure, pinned to the top of the viewport on mobile while the user scrolls the inputs. */
  sticky?: { label: string; value: string } | null
}

/**
 * The layout every calculator shares (design spec §4): inputs on the left,
 * results and charts on the right on desktop; stacked on mobile with the
 * headline figure pinned above the fold (design decision D3 — always-live,
 * no Calculate button, so the sticky bar is what keeps the result visible
 * while scrolling a long input list).
 */
export function CalculatorShell({ form, results, sticky }: CalculatorShellProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-8">
      <div className="order-1 lg:order-none">
        {sticky && (
          // Solid background, no blur/opacity — an alpha+blur combo on a
          // custom color token can render see-through on some mobile
          // browsers, and this bar exists specifically to stay legible
          // over whatever scrolls underneath it.
          <div className="figures sticky top-16 z-10 mb-4 flex items-center justify-between rounded-card border border-line-strong bg-surface px-4 py-3 shadow-sm lg:hidden">
            <span className="text-xs font-medium text-ink-muted">{sticky.label}</span>
            <span className="text-lg font-semibold text-accent">{sticky.value}</span>
          </div>
        )}
        <Card>
          <CardContent className="pt-5">{form}</CardContent>
        </Card>
      </div>
      <div className="order-2 min-w-0 space-y-6 lg:order-none">{results}</div>
    </div>
  )
}
