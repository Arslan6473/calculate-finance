import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-10 w-full min-w-0 rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink transition-colors placeholder:text-ink-subtle',
        'focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
        'aria-invalid:border-loss aria-invalid:ring-loss/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export { Input }
