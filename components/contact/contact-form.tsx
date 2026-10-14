'use client'

import * as React from 'react'

import { contactFormSchema } from '@/lib/validation/contact'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Not rendered anywhere on the page — only used as the mailto target on submit.
const CONTACT_EMAIL = 'arslansarwarwebdev@gmail.com'

/**
 * A validated contact form with no backend wired up yet. On successful
 * validation it opens the visitor's mail client with the message pre-filled
 * — genuinely functional without inventing a submission endpoint that
 * doesn't exist. Swap this handler for a real API route once one exists.
 */
export function ContactForm() {
  const [values, setValues] = React.useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const result = contactFormSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = String(issue.path[0])
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    const { name, email, subject, message } = result.data
    const body = `From: ${name} (${email})\n\n${message}`
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  function field(name: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            value={values.name}
            onChange={(e) => field('name', e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
          />
          {errors.name && <p id="contact-name-error" className="text-xs text-loss">{errors.name}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            value={values.email}
            onChange={(e) => field('email', e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
          />
          {errors.email && <p id="contact-email-error" className="text-xs text-loss">{errors.email}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-subject">Subject</Label>
        <Input
          id="contact-subject"
          value={values.subject}
          onChange={(e) => field('subject', e.target.value)}
          aria-invalid={!!errors.subject}
          aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
        />
        {errors.subject && <p id="contact-subject-error" className="text-xs text-loss">{errors.subject}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <textarea
          id="contact-message"
          value={values.message}
          onChange={(e) => field('message', e.target.value)}
          rows={6}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          className="flex w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink transition-colors placeholder:text-ink-subtle focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 aria-invalid:border-loss aria-invalid:ring-loss/20"
        />
        {errors.message && <p id="contact-message-error" className="text-xs text-loss">{errors.message}</p>}
      </div>

      <Button type="submit">Send message</Button>
    </form>
  )
}
