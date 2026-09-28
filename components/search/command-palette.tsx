'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { Search } from 'lucide-react'

import { CALCULATORS } from '@/config/calculators'
import { CATEGORIES } from '@/config/categories'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Global calculator search (brief §14), reachable via the header search
 * button or Cmd/Ctrl+K from anywhere in the app. Renders in a `cmdk` dialog,
 * which manages its own focus trap and keyboard navigation.
 */
export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  function go(href: string) {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      {/* Icon-only trigger below `sm` — a shrinking pill risks overflowing the header on narrow phones. */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="sm:hidden"
        aria-label="Search calculators"
      >
        <Search />
      </Button>

      {/* Full pill trigger at `sm` and above, where the header has room. */}
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="hidden h-9 max-w-64 justify-start gap-2 px-3 text-ink-subtle sm:flex"
        aria-label="Search calculators"
      >
        <Search className="size-4" />
        <span>Search calculators…</span>
        <kbd className="ml-auto hidden rounded border border-line-strong px-1.5 py-0.5 text-[10px] text-ink-subtle md:inline">
          ⌘K
        </kbd>
      </Button>

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Search calculators"
        overlayClassName={cn('fixed inset-0 z-50 bg-ink/40')}
        contentClassName={cn(
          'fixed top-24 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-card border border-line bg-surface shadow-xl'
        )}
      >
        <div className="flex items-center gap-2 border-b border-line px-4">
          <Search className="size-4 text-ink-subtle" />
          <Command.Input
            placeholder="Try: mortgage, compound interest, ROI…"
            className="h-12 w-full bg-transparent text-sm text-ink placeholder:text-ink-subtle focus:outline-none"
          />
        </div>
        <Command.List className="max-h-96 overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-ink-muted">
            No calculators found.
          </Command.Empty>
          <Command.Group heading="Calculators" className="text-xs font-medium text-ink-subtle [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
            {CALCULATORS.map((calc) => (
              <Command.Item
                key={calc.slug}
                value={`${calc.name} ${calc.summary} ${CATEGORIES[calc.category].name}`}
                onSelect={() => go(`/calculators/${calc.slug}`)}
                className="flex cursor-pointer flex-col gap-0.5 rounded-md px-2 py-2 text-sm data-[selected=true]:bg-surface-muted"
              >
                <span className="font-medium text-ink">{calc.name}</span>
                <span className="text-xs text-ink-muted">
                  {CATEGORIES[calc.category].name} · {calc.summary}
                </span>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command.Dialog>
    </>
  )
}
