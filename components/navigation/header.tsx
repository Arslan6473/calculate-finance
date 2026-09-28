import Link from 'next/link'
import { Calculator } from 'lucide-react'

import { NAV_LINKS, SITE } from '@/config/site'
import { CommandPalette } from '@/components/search/command-palette'
import { CurrencySwitcher } from '@/components/navigation/currency-switcher'
import { ThemeToggle } from '@/components/navigation/theme-toggle'
import { MobileNav } from '@/components/navigation/mobile-nav'

export function Header() {
  return (
    // A fully opaque background — an alpha/blur combo on a custom color
    // token can render inconsistently (looking washed-out or see-through)
    // on some mobile browsers, and a sticky nav needs to reliably cover
    // whatever scrolls underneath it.
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-ink">
          <span className="flex size-8 items-center justify-center rounded-md bg-accent text-accent-ink">
            <Calculator className="size-4.5" />
          </span>
          <span className="hidden sm:inline">{SITE.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          <CommandPalette />
          <CurrencySwitcher />
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
