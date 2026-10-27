import type { Metadata } from 'next'

import { CONTACT_EMAIL, EDITORIAL, SITE } from '@/config/site'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { ContactForm } from '@/components/contact/contact-form'

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with the ${SITE.name} team.`,
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <div className="container-page max-w-lg py-8">
      <Breadcrumbs items={[{ label: 'Contact', href: '/contact' }]} />
      <h1 className="mb-2 text-3xl font-bold text-ink">Contact Us</h1>
      <p className="mb-4 text-ink-muted">
        Found an error in a calculation, or have a suggestion? Send a message with the form below,
        or email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent underline underline-offset-2">
          {CONTACT_EMAIL}
        </a>{' '}
        directly.
      </p>
      <p className="mb-8 text-sm text-ink-muted">
        Messages are read by {EDITORIAL.name}, who builds and maintains {SITE.name}.
      </p>
      <ContactForm />
    </div>
  )
}
