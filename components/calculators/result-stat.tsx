import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface ResultStatProps {
  label: string
  value: string
  /** Renders larger and in the accent color — the number the user came for. */
  primary?: boolean
  tone?: 'default' | 'gain' | 'loss'
  hint?: string
}

/** A single labelled figure. Composed into grids to build a results panel. */
export function ResultStat({ label, value, primary, tone = 'default', hint }: ResultStatProps) {
  return (
    <div className={cn(primary && 'sm:col-span-2')}>
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p
        className={cn(
          'figures mt-1 font-semibold text-ink',
          primary ? 'text-3xl' : 'text-xl',
          tone === 'gain' && 'text-gain',
          tone === 'loss' && 'text-loss',
          tone === 'default' && primary && 'text-accent'
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-ink-subtle">{hint}</p>}
    </div>
  )
}

export function ResultGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">{children}</div>
}
