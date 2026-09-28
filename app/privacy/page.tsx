import type { Metadata } from 'next'

import { SITE } from '@/config/site'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${SITE.name} handles data and analytics.`,
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <div className="container-page max-w-2xl py-8">
      <Breadcrumbs items={[{ label: 'Privacy Policy', href: '/privacy' }]} />
      <h1 className="mb-6 text-3xl font-bold text-ink">Privacy Policy</h1>

      <div className="space-y-4 text-ink-muted">
        <p>
          {SITE.name}&apos;s calculators run entirely in your browser. The numbers you enter into
          a calculator — a home price, a salary, a debt balance — are used only to compute your
          result on your device and are never sent to our servers or stored by us.
        </p>
        <h2 className="pt-4 text-xl font-semibold text-ink">What We Store Locally</h2>
        <p>
          Your preferred currency and light/dark theme are saved in your browser&apos;s local
          storage so they persist between visits. This information stays on your device and is
          not transmitted to us.
        </p>
        <h2 className="pt-4 text-xl font-semibold text-ink">Analytics</h2>
        <p>
          We may use privacy-conscious analytics to understand which calculators and guides are
          useful, such as which calculator pages are visited. We do not collect the specific
          numbers you enter into a calculator, and we do not build individual profiles from
          calculator usage.
        </p>
        <h2 className="pt-4 text-xl font-semibold text-ink">Cookies</h2>
        <p>
          We use only the cookies or local storage necessary for basic site functionality, such
          as remembering your theme and currency preference. We do not use advertising cookies to
          track you across other websites at this time; if that changes, this policy will be
          updated accordingly.
        </p>
        <h2 className="pt-4 text-xl font-semibold text-ink">Contact</h2>
        <p>
          Questions about this policy can be sent through our{' '}
          <a href="/contact" className="text-accent underline underline-offset-2">
            contact page
          </a>
          .
        </p>
      </div>
    </div>
  )
}
