import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import type { CalculatorConfig } from '@/config/calculators/types'
import { Card, CardContent } from '@/components/ui/card'
import { CARD_HOVER_CLASSES, IconBadge, getCalculatorIcon } from '@/components/calculators/calculator-icons'

/**
 * Renders the "Related Calculators" links every calculator page carries
 * (brief §13's aggressive-but-natural internal linking). Calculators are
 * passed in already resolved — the registry's `assertRegistryIntegrity()`
 * guarantees every slug reaching this component actually exists.
 */
export function RelatedCalculators({ calculators }: { calculators: CalculatorConfig[] }) {
  if (calculators.length === 0) return null

  return (
    <section aria-labelledby="related-heading">
      <h2 id="related-heading" className="mb-4 text-2xl font-semibold text-ink">
        Related Calculators
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {calculators.map((calc) => (
          <Link key={calc.slug} href={`/calculators/${calc.slug}`} className="group">
            <Card className={CARD_HOVER_CLASSES}>
              <CardContent className="flex items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-3">
                  <IconBadge icon={getCalculatorIcon(calc.slug)} />
                  <div>
                    <p className="font-medium text-ink">{calc.name}</p>
                    <p className="mt-0.5 text-sm text-ink-muted">{calc.summary}</p>
                  </div>
                </div>
                <ArrowRight className="size-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
