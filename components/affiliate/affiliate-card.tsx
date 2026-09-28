import { ExternalLink } from 'lucide-react'

import type { AffiliatePlacement } from '@/config/affiliate'
import { Card, CardContent } from '@/components/ui/card'

export function AffiliateCard({ placement }: { placement: AffiliatePlacement }) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 py-4">
        <div>
          <p className="font-medium text-ink">{placement.name}</p>
          <p className="mt-0.5 text-sm text-ink-muted">{placement.description}</p>
        </div>
        <a
          href={placement.href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          Learn more
          <ExternalLink className="size-3.5" />
        </a>
      </CardContent>
    </Card>
  )
}

/** Renders every placement configured for a given calculator, or none if there are no matches (brief §16: no spammy placements). */
export function AffiliateCardList({
  placements,
  calculatorSlug,
}: {
  placements: AffiliatePlacement[]
  calculatorSlug: string
}) {
  const matches = placements.filter(
    (p) => p.showOnCalculators.length === 0 || p.showOnCalculators.includes(calculatorSlug)
  )
  if (matches.length === 0) return null

  return (
    <div className="space-y-3">
      {matches.map((placement) => (
        <AffiliateCard key={placement.id} placement={placement} />
      ))}
    </div>
  )
}
