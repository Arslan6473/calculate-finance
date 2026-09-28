import type { Metadata } from 'next'

import { SITE } from '@/config/site'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `The terms governing use of ${SITE.name}.`,
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <div className="container-page max-w-2xl py-8">
      <Breadcrumbs items={[{ label: 'Terms of Service', href: '/terms' }]} />
      <h1 className="mb-6 text-3xl font-bold text-ink">Terms of Service</h1>

      <div className="space-y-4 text-ink-muted">
        <p>
          By using {SITE.name}, you agree to these terms. If you do not agree, please do not use
          this site.
        </p>
        <h2 className="pt-4 text-xl font-semibold text-ink">Use of Calculators</h2>
        <p>
          {SITE.name}&apos;s calculators are provided for general informational and educational
          purposes. You are responsible for verifying any result before relying on it for a
          financial decision. See our{' '}
          <a href="/disclaimer" className="text-accent underline underline-offset-2">
            disclaimer
          </a>{' '}
          for the full scope of what our calculators are intended for.
        </p>
        <h2 className="pt-4 text-xl font-semibold text-ink">Acceptable Use</h2>
        <p>
          You agree not to misuse this site — including attempting to disrupt its normal
          operation, scraping content at a rate that degrades service for other users, or
          reproducing substantial portions of our written guides or calculator explanations
          without permission.
        </p>
        <h2 className="pt-4 text-xl font-semibold text-ink">Intellectual Property</h2>
        <p>
          The calculators, design, and written content on {SITE.name} are our property or used
          under license. You may link to any page freely; please do not republish our
          explanatory content or FAQs elsewhere without permission.
        </p>
        <h2 className="pt-4 text-xl font-semibold text-ink">Limitation of Liability</h2>
        <p>
          {SITE.name} is provided without warranty of any kind. To the fullest extent permitted by
          law, {SITE.name} is not liable for any decision made, or loss incurred, based on the use
          of our calculators or content.
        </p>
        <h2 className="pt-4 text-xl font-semibold text-ink">Changes to These Terms</h2>
        <p>
          We may update these terms from time to time. Continued use of the site after a change
          constitutes acceptance of the updated terms.
        </p>
      </div>
    </div>
  )
}
