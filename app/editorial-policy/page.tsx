import type { Metadata } from 'next'
import Link from 'next/link'

import { EDITORIAL, SITE } from '@/config/site'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'

export const metadata: Metadata = {
  title: 'Editorial Policy',
  description: `Who writes ${SITE.name}'s guides and calculators, how we research and check them, and how we handle corrections.`,
  alternates: { canonical: '/editorial-policy' },
}

const linkClass = 'text-accent underline underline-offset-2'

export default function EditorialPolicyPage() {
  return (
    <div className="container-page max-w-2xl py-8">
      <Breadcrumbs items={[{ label: 'Editorial Policy', href: '/editorial-policy' }]} />
      <h1 className="mb-6 text-3xl font-bold text-ink">Editorial Policy</h1>

      <div className="space-y-4 text-ink-muted">
        <p>
          Every guide and calculator explanation on {SITE.name} is written and reviewed by the{' '}
          {EDITORIAL.name}. This page explains how that content is produced, what it is based on,
          and what to do if you find a mistake.
        </p>

        <h2 className="pt-4 text-xl font-semibold text-ink">Who We Are</h2>
        <p>
          The {EDITORIAL.name} is the small team that builds and maintains {SITE.name}. We are not
          licensed financial advisors, tax preparers, or lenders, and nothing on this site is
          personalized advice. Our goal is narrower: to explain how common financial calculations
          work, accurately and in plain language, so you can understand the numbers before you
          talk to a professional or make a decision.
        </p>

        <h2 className="pt-4 text-xl font-semibold text-ink">How Content Is Researched</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Formulas follow the standard definitions used by lenders, investors, and textbooks —
            for example, the standard amortization formula for loan payments and the usual
            definitions of cap rate and cash-on-cash return.
          </li>
          <li>
            Tax figures, such as federal income tax brackets and FICA rates, are taken from
            official government publications for the tax year stated on the page.
          </li>
          <li>
            Rules of thumb — like the 28/36 debt-to-income guideline or the 30% rent rule — are
            presented as rules of thumb, with their limits explained, never as requirements.
          </li>
          <li>We do not publish invented statistics, testimonials, or reviews.</li>
        </ul>

        <h2 className="pt-4 text-xl font-semibold text-ink">How Content Is Checked</h2>
        <p>
          Every calculation engine is covered by automated tests against hand-verified results,
          including edge cases such as zero interest rates and very large values. Worked examples
          in guides are recalculated before publishing so the numbers in the text match what the
          calculators produce.
        </p>

        <h2 className="pt-4 text-xl font-semibold text-ink">Independence</h2>
        <p>
          Content is written to be useful, not to sell a product. Where a page includes an
          affiliate link or advertising, it is labeled, and it does not change the calculations or
          the explanation around them.
        </p>

        <h2 className="pt-4 text-xl font-semibold text-ink">Corrections</h2>
        <p>
          If you believe a formula, figure, or explanation on this site is wrong or out of date,
          please{' '}
          <Link href="/contact" className={linkClass}>
            contact us
          </Link>
          . We review every report and correct confirmed errors as quickly as we can.
        </p>

        <p className="pt-4">
          See also our{' '}
          <Link href="/about" className={linkClass}>
            about page
          </Link>{' '}
          and{' '}
          <Link href="/disclaimer" className={linkClass}>
            disclaimer
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
