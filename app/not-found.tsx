import type { Metadata } from 'next'
import Link from 'next/link'

import { POPULAR_CALCULATOR_SLUGS } from '@/config/site'
import { getCalculator } from '@/config/calculators'

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false },
}

export default function NotFound() {
  const popular = POPULAR_CALCULATOR_SLUGS.slice(0, 6)
    .map((slug) => getCalculator(slug))
    .filter((c): c is NonNullable<typeof c> => !!c)

  return (
    <div className="container-page max-w-2xl py-16 text-center">
      <p className="text-sm font-semibold text-accent">404</p>
      <h1 className="mt-2 text-3xl font-bold text-ink">We couldn&apos;t find that page</h1>
      <p className="mt-3 text-ink-muted">
        The link may be broken or the page may have moved. Try one of these instead.
      </p>

      <ul className="mt-8 grid gap-2 sm:grid-cols-2">
        {popular.map((calc) => (
          <li key={calc.slug}>
            <Link
              href={`/calculators/${calc.slug}`}
              className="block rounded-md border border-line bg-surface px-4 py-3 text-sm font-medium text-ink hover:border-accent"
            >
              {calc.name}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex justify-center gap-6 text-sm font-medium">
        <Link href="/" className="text-accent hover:underline">
          Home
        </Link>
        <Link href="/calculators" className="text-accent hover:underline">
          All calculators
        </Link>
        <Link href="/guides" className="text-accent hover:underline">
          Guides
        </Link>
      </div>
    </div>
  )
}
