import type { Metadata } from 'next'

import { SITE } from '@/config/site'
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
      <p className="mb-8 text-ink-muted">
        Found an error in a calculation, or have a suggestion? Send us a message.
      </p>
      <ContactForm />
    </div>
  )
}
