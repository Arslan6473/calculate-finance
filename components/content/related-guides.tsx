import Link from 'next/link'
import { BookOpen } from 'lucide-react'

import type { GuideConfig } from '@/config/guides'

/** Plain links from a calculator page to the guides that explain it in depth. */
export function RelatedGuides({ guides }: { guides: GuideConfig[] }) {
  if (guides.length === 0) return null

  return (
    <section aria-labelledby="related-guides-heading">
      <h2 id="related-guides-heading" className="mb-4 text-2xl font-semibold text-ink">
        Related Guides
      </h2>
      <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {guides.map((guide) => (
          <li key={guide.slug} className="flex items-start gap-2">
            <BookOpen className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            <Link
              href={`/guides/${guide.slug}`}
              className="text-ink underline-offset-2 hover:text-accent hover:underline"
            >
              {guide.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
