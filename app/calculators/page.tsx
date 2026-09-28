import Link from 'next/link'
import type { Metadata } from 'next'

import { CALCULATORS, getCalculatorsByCategory } from '@/config/calculators'
import { CATEGORIES } from '@/config/categories'
import { SITE } from '@/config/site'
import { Card, CardContent } from '@/components/ui/card'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { CARD_HOVER_CLASSES, IconBadge, getCalculatorIcon } from '@/components/calculators/calculator-icons'

export const metadata: Metadata = {
  title: 'All Financial Calculators',
  description: `Browse all ${CALCULATORS.length} free financial calculators on ${SITE.name}, organized by category.`,
  alternates: { canonical: '/calculators' },
}

export default function CalculatorsIndexPage() {
  const populatedCategories = Object.values(CATEGORIES).filter((c) =>
    CALCULATORS.some((calc) => calc.category === c.slug)
  )

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: 'Calculators', href: '/calculators' }]} />
      <h1 className="mb-2 text-3xl font-bold text-ink sm:text-4xl">All Financial Calculators</h1>
      <p className="mb-10 max-w-2xl text-ink-muted">
        {CALCULATORS.length} free calculators for loans, investments, debt, salary, and real estate.
      </p>

      <div className="space-y-12">
        {populatedCategories.map((category) => (
          <section key={category.slug} aria-labelledby={`category-${category.slug}`}>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 id={`category-${category.slug}`} className="text-xl font-semibold text-ink">
                {category.name}
              </h2>
              <Link href={`/category/${category.slug}`} className="text-sm font-medium text-accent hover:underline">
                View category
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {getCalculatorsByCategory(category.slug).map((calc) => (
                <Link key={calc.slug} href={`/calculators/${calc.slug}`} className="group">
                  <Card className={CARD_HOVER_CLASSES}>
                    <CardContent className="flex items-start gap-4 pt-5">
                      <IconBadge icon={getCalculatorIcon(calc.slug)} />
                      <div>
                        <p className="font-medium text-ink">{calc.name}</p>
                        <p className="mt-1 text-sm text-ink-muted">{calc.summary}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
