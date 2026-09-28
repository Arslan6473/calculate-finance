import type { Metadata } from 'next'

import { SITE } from '@/config/site'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'

export const metadata: Metadata = {
  title: 'About',
  description: `What ${SITE.name} is, and the principles behind how we build our calculators.`,
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <div className="container-page max-w-2xl py-8">
      <Breadcrumbs items={[{ label: 'About', href: '/about' }]} />
      <h1 className="mb-6 text-3xl font-bold text-ink">About {SITE.name}</h1>

      <div className="space-y-4 text-ink-muted">
        <p>
          {SITE.name} builds free, accurate calculators for the financial decisions people
          actually face — mortgages, loans, investments, debt, salary, and retirement. Every
          calculator uses the same formulas a lender, financial advisor, or spreadsheet would use,
          shown with a full breakdown rather than a single opaque number.
        </p>
        <p>
          We don&apos;t believe in thin, keyword-stuffed calculator pages. Every calculator on this
          site ships with a working tool, a plain-language explanation of how it&apos;s calculated,
          a worked example, and answers to the questions people actually ask about that
          calculation.
        </p>
        <h2 className="pt-4 text-xl font-semibold text-ink">How We Build Calculators</h2>
        <p>
          Every calculation engine is covered by automated tests against known, hand-verified
          results — including edge cases like zero interest rates, zero balances, and unusually
          large numbers. If a formula on this site produces a result you believe is wrong, please{' '}
          <a href="/contact" className="text-accent underline underline-offset-2">
            let us know
          </a>
          .
        </p>
        <h2 className="pt-4 text-xl font-semibold text-ink">What We Are Not</h2>
        <p>
          {SITE.name} is an educational and calculation tool, not a financial advisor, tax
          preparer, lender, or broker. See our{' '}
          <a href="/disclaimer" className="text-accent underline underline-offset-2">
            disclaimer
          </a>{' '}
          for the full scope of what our calculators are — and are not — intended for.
        </p>
      </div>
    </div>
  )
}
