import type { Metadata } from 'next'

import { CONTACT_EMAIL, SITE } from '@/config/site'
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
      <h1 className="mb-2 text-3xl font-bold text-ink">Privacy Policy</h1>
      <p className="mb-6 text-sm text-ink-subtle">
        Effective date: <time dateTime="2026-10-27">October 27, 2026</time>
      </p>

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
          We use Vercel Web Analytics to understand which calculators and guides are useful. It
          records aggregate page views along with general information such as referring site,
          browser, device type, and country, and it does not use cookies. We do not collect the
          specific numbers you enter into a calculator, and we do not build individual profiles
          from calculator usage.
        </p>
        <h2 className="pt-4 text-xl font-semibold text-ink">Cookies</h2>
        <p>
          We use cookies or local storage for basic site functionality, such as remembering your
          theme and currency preference. These stay in your browser and are not used to track you.
        </p>
        <h2 className="pt-4 text-xl font-semibold text-ink">Advertising</h2>
        <p>
          When advertising is shown on {SITE.name}, it may be served by third-party vendors,
          including Google. These vendors use cookies to serve ads based on your prior visits to
          this website or other websites. Google&apos;s use of advertising cookies enables it and
          its partners to serve ads to you based on your visits to this and other sites on the
          internet.
        </p>
        <p>
          You can opt out of personalized advertising by visiting Google&apos;s{' '}
          <a
            href="https://www.google.com/settings/ads"
            className="text-accent underline underline-offset-2"
            rel="noopener noreferrer"
            target="_blank"
          >
            Ads Settings
          </a>
          . You can also opt out of some third-party vendors&apos; use of cookies for personalized
          advertising at{' '}
          <a
            href="https://www.aboutads.info/choices/"
            className="text-accent underline underline-offset-2"
            rel="noopener noreferrer"
            target="_blank"
          >
            aboutads.info
          </a>
          . Advertising never affects the calculations or the content on this site.
        </p>
        <h2 className="pt-4 text-xl font-semibold text-ink">Contact</h2>
        <p>
          Questions about this policy can be sent to{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent underline underline-offset-2">
            {CONTACT_EMAIL}
          </a>{' '}
          or through our{' '}
          <a href="/contact" className="text-accent underline underline-offset-2">
            contact page
          </a>
          .
        </p>
      </div>
    </div>
  )
}
