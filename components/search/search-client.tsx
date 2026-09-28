'use client'

import * as React from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

import { searchCalculators } from '@/lib/search/search-calculators'
import { CATEGORIES } from '@/config/categories'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CARD_HOVER_CLASSES, IconBadge, getCalculatorIcon } from '@/components/calculators/calculator-icons'

/**
 * Renders search results for the given query and stays live as the user
 * types (brief §14). `initialQuery` comes from the `?q=` search param so the
 * page shows correct results even before hydration.
 */
export function SearchClient({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = React.useState(initialQuery)
  const results = React.useMemo(() => searchCalculators(query), [query])

  return (
    <div>
      <div className="relative mb-6 max-w-xl">
        <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-ink-subtle" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search calculators…"
          aria-label="Search calculators"
          className="pl-9"
        />
      </div>

      {results.length === 0 ? (
        <p className="text-ink-muted">No calculators match &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((calc) => (
            <Link key={calc.slug} href={`/calculators/${calc.slug}`} className="group">
              <Card className={CARD_HOVER_CLASSES}>
                <CardContent className="flex items-start gap-4 py-4">
                  <IconBadge icon={getCalculatorIcon(calc.slug)} />
                  <div>
                    <p className="font-medium text-ink">{calc.name}</p>
                    <p className="mt-0.5 text-sm text-ink-muted">
                      {CATEGORIES[calc.category].name} · {calc.summary}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
