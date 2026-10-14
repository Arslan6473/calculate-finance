import type { Metadata } from 'next'

import { CHANGELOG } from '@/config/changelog'
import { SITE } from '@/config/site'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'

export const metadata: Metadata = {
  title: 'Changelog',
  description: `A dated record of new calculators, guides, and updates on ${SITE.name}.`,
  alternates: { canonical: '/changelog' },
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export default function ChangelogPage() {
  return (
    <div className="container-page max-w-2xl py-8">
      <Breadcrumbs items={[{ label: 'Changelog', href: '/changelog' }]} />
      <h1 className="mb-2 text-3xl font-bold text-ink">Changelog</h1>
      <p className="mb-8 text-ink-muted">
        What&apos;s new on {SITE.name}. Tax figures and rates are reviewed at least once a year.
      </p>

      <ol className="space-y-10">
        {CHANGELOG.map((entry) => (
          <li key={entry.date} className="border-l-2 border-accent pl-5">
            <time dateTime={entry.date} className="text-sm font-medium text-accent">
              {formatDate(entry.date)}
            </time>
            <h2 className="mt-1 text-xl font-semibold text-ink">{entry.title}</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-muted">
              {entry.changes.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  )
}
