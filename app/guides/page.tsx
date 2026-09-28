import Link from 'next/link'
import type { Metadata } from 'next'
import { BookOpen } from 'lucide-react'

import { GUIDES } from '@/config/guides'
import { SITE } from '@/config/site'
import { Card, CardContent } from '@/components/ui/card'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { CARD_HOVER_CLASSES, IconBadge } from '@/components/calculators/calculator-icons'

export const metadata: Metadata = {
  title: 'Financial Guides',
  description: `Plain-language guides on compound interest, mortgages, ROI, and more from ${SITE.name}.`,
  alternates: { canonical: '/guides' },
}

export default function GuidesIndexPage() {
  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: 'Guides', href: '/guides' }]} />
      <h1 className="mb-2 text-3xl font-bold text-ink sm:text-4xl">Financial Guides</h1>
      <p className="mb-10 max-w-2xl text-ink-muted">
        Plain-language explanations of the concepts behind our calculators.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GUIDES.map((guide) => (
          <Link key={guide.slug} href={`/guides/${guide.slug}`} className="group">
            <Card className={CARD_HOVER_CLASSES}>
              <CardContent className="flex items-start gap-4 pt-5">
                <IconBadge icon={BookOpen} />
                <div>
                  <p className="font-medium text-ink">{guide.title}</p>
                  <p className="mt-1 text-sm text-ink-muted">{guide.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
