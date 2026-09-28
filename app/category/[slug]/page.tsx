import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { getCalculatorsByCategory, getPopulatedCategorySlugs } from '@/config/calculators'
import { getCategory } from '@/config/categories'
import { SITE } from '@/config/site'
import { Card, CardContent } from '@/components/ui/card'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { breadcrumbSchema } from '@/lib/seo/schema'
import { CARD_HOVER_CLASSES, IconBadge, getCalculatorIcon } from '@/components/calculators/calculator-icons'

/**
 * Only categories with at least one calculator are generated (design spec §3.3
 * / `config/categories.ts`), so a category with nothing in it — currently
 * `business` — never ships as a thin page.
 */
export function generateStaticParams() {
  return getPopulatedCategorySlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps<'/category/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const category = getCategory(slug)
  if (!category) return {}

  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/category/${category.slug}` },
  }
}

export default async function CategoryPage({ params }: PageProps<'/category/[slug]'>) {
  const { slug } = await params
  const category = getCategory(slug)
  if (!category) notFound()

  const calculators = getCalculatorsByCategory(category.slug)
  if (calculators.length === 0) notFound()

  const breadcrumbItems = [
    { label: 'Calculators', href: '/calculators' },
    { label: category.name, href: `/category/${category.slug}` },
  ]

  return (
    <div className="container-page py-8">
      <JsonLd data={breadcrumbSchema(breadcrumbItems)} />
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="mb-2 text-3xl font-bold text-ink sm:text-4xl">{category.name}</h1>
      <p className="mb-10 max-w-2xl text-ink-muted">{category.description}</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {calculators.map((calc) => (
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

      <p className="mt-10 text-sm text-ink-subtle">
        Looking for something else? See{' '}
        <Link href="/calculators" className="text-accent hover:underline">
          all {SITE.name} calculators
        </Link>
        .
      </p>
    </div>
  )
}
