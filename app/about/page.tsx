import type { Metadata } from 'next'
import Link from 'next/link'

import { CONTACT_EMAIL, EDITORIAL, SITE } from '@/config/site'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'

export const metadata: Metadata = {
  title: 'About',
  description: `Who builds ${SITE.name}, why it exists, and how every calculator's formulas are checked.`,
  alternates: { canonical: '/about' },
}

const linkClass = 'text-accent underline underline-offset-2'

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

        <h2 className="pt-4 text-xl font-semibold text-ink">Who Runs {SITE.name}</h2>
        <p>
          {SITE.name} is built and maintained by {EDITORIAL.name}, a software developer based in
          Pakistan. Arslan writes the calculators, the explanations that go with them, and the
          guides, and tests each calculation against published formulas and official sources.
        </p>
        <p>
          Arslan is a web developer, not a licensed financial advisor, accountant, or lender. The
          site&apos;s job is to show how standard financial calculations work and let you run them
          on your own numbers — not to give personal advice.
        </p>

        <h2 className="pt-4 text-xl font-semibold text-ink">Why {SITE.name} Exists</h2>
        <p>
          Many calculator pages give a single number with no explanation of how it was reached,
          or bury the tool under thin, keyword-stuffed text. {SITE.name} was started to do the
          opposite: every calculator ships with a working tool, a plain-language explanation of
          how it&apos;s calculated, a worked example, and answers to the questions people actually
          ask about that calculation.
        </p>

        <h2 className="pt-4 text-xl font-semibold text-ink">How Formulas Are Checked</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Formulas follow standard published definitions — for example, the standard
            amortization formula for loan payments — and tax figures come from official government
            publications for the tax year stated on the page.
          </li>
          <li>
            Every calculation engine is covered by automated tests against known, hand-verified
            results, including edge cases like zero interest rates, zero balances, and unusually
            large numbers.
          </li>
          <li>
            Worked examples in the guides and calculator pages are recalculated before publishing
            so the numbers in the text match what the calculators produce.
          </li>
          <li>
            Every calculator and guide lists its sources and shows the date it was last updated.
            Changes are recorded in the{' '}
            <Link href="/changelog" className={linkClass}>
              changelog
            </Link>
            .
          </li>
        </ul>
        <p>
          The{' '}
          <Link href="/editorial-policy" className={linkClass}>
            editorial policy
          </Link>{' '}
          covers how content is researched and corrected in more detail.
        </p>

        <h2 className="pt-4 text-xl font-semibold text-ink">Contact</h2>
        <p>
          If a formula on this site produces a result you believe is wrong, or you have a question
          or suggestion, email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
            {CONTACT_EMAIL}
          </a>{' '}
          or use the{' '}
          <Link href="/contact" className={linkClass}>
            contact page
          </Link>
          .
        </p>

        <h2 className="pt-4 text-xl font-semibold text-ink">What {SITE.name} Is Not</h2>
        <p>
          {SITE.name} is an educational and calculation tool, not a financial advisor, tax
          preparer, lender, or broker. See the{' '}
          <Link href="/disclaimer" className={linkClass}>
            disclaimer
          </Link>{' '}
          for the full scope of what the calculators are — and are not — intended for.
        </p>
      </div>
    </div>
  )
}
