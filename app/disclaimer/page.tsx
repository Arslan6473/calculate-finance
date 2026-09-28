import type { Metadata } from 'next'

import { SITE } from '@/config/site'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: `The scope and limitations of ${SITE.name}'s calculators and content.`,
  alternates: { canonical: '/disclaimer' },
}

export default function DisclaimerPage() {
  return (
    <div className="container-page max-w-2xl py-8">
      <Breadcrumbs items={[{ label: 'Disclaimer', href: '/disclaimer' }]} />
      <h1 className="mb-6 text-3xl font-bold text-ink">Disclaimer</h1>

      <div className="space-y-4 text-ink-muted">
        <p>
          {SITE.name} provides calculators and educational content for general informational
          purposes only. The results produced by our calculators are estimates based on the
          inputs you provide and the assumptions stated on each calculator page. They are not,
          and should not be relied upon as, financial, investment, tax, or legal advice.
        </p>
        <p>
          Financial calculations involve assumptions about the future — interest rates, market
          returns, inflation, tax rules, and personal circumstances — that are inherently
          uncertain. Actual results will differ from any projection, and past performance
          assumptions used in an investment or retirement calculation are not a guarantee of
          future results.
        </p>
        <h2 className="pt-4 text-xl font-semibold text-ink">Tax Calculations</h2>
        <p>
          The Salary Calculator applies the 2026 US federal income tax brackets and FICA rates as
          published by the relevant federal authorities at the time of writing. It does not
          model every possible federal tax situation (such as self-employment tax, tax credits,
          or itemized deductions beyond what the calculator asks for), and state and local tax is
          applied only as the flat rate you provide, since state and local tax rules vary too
          widely to calculate precisely without knowing your specific state and municipality.
          This calculator is not a substitute for tax preparation software or a qualified tax
          professional.
        </p>
        <h2 className="pt-4 text-xl font-semibold text-ink">No Professional Relationship</h2>
        <p>
          Using {SITE.name} does not create any advisory, fiduciary, or professional relationship
          between you and {SITE.name}. Before making significant financial decisions, consult a
          qualified financial advisor, accountant, or attorney who can consider your complete
          financial situation.
        </p>
        <h2 className="pt-4 text-xl font-semibold text-ink">No Warranty</h2>
        <p>
          While we test our calculation logic against known results, {SITE.name} is provided
          &ldquo;as is&rdquo; without warranty of any kind, express or implied, including but not
          limited to accuracy, completeness, or fitness for a particular purpose.
        </p>
      </div>
    </div>
  )
}
