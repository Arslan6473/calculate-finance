import Link from 'next/link'

import { CALCULATORS } from '@/config/calculators'
import { CATEGORIES } from '@/config/categories'
import { getGuide, type GuideConfig } from '@/config/guides'
import { FOOTER_GUIDE_SLUGS, FOOTER_LEGAL_LINKS, POPULAR_CALCULATOR_SLUGS, SITE } from '@/config/site'

export function Footer() {
  const popular = POPULAR_CALCULATOR_SLUGS.map((slug) => CALCULATORS.find((c) => c.slug === slug)).filter(
    (c): c is (typeof CALCULATORS)[number] => !!c
  )
  const guides = FOOTER_GUIDE_SLUGS.map((slug) => getGuide(slug)).filter((g): g is GuideConfig => !!g)
  const categories = Object.values(CATEGORIES).filter((c) =>
    CALCULATORS.some((calc) => calc.category === c.slug)
  )

  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">Categories</h3>
          <ul className="space-y-2 text-sm">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={`/category/${category.slug}`} className="text-ink-muted hover:text-ink">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">Popular Calculators</h3>
          <ul className="space-y-2 text-sm">
            {popular.map((calc) => (
              <li key={calc.slug}>
                <Link href={`/calculators/${calc.slug}`} className="text-ink-muted hover:text-ink">
                  {calc.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">Financial Guides</h3>
          <ul className="space-y-2 text-sm">
            {guides.map((guide) => (
              <li key={guide.slug}>
                <Link href={`/guides/${guide.slug}`} className="text-ink-muted hover:text-ink">
                  {guide.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/guides" className="font-medium text-accent hover:underline">
                View all guides →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">Company & Legal</h3>
          <ul className="space-y-2 text-sm">
            {FOOTER_LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-ink-muted hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-page border-t border-line py-6 text-xs text-ink-subtle">
        <p className="max-w-3xl">
          {SITE.name} provides calculators and educational information for general informational
          purposes only. {SITE.disclaimerShort}{' '}
          <Link href="/disclaimer" className="underline hover:text-ink-muted">
            Read the full disclaimer
          </Link>
          .
        </p>
        <p className="mt-3">© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
      </div>
    </footer>
  )
}
