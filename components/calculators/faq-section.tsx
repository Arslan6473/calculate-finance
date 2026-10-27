import type { CalculatorFaq } from '@/config/calculators/types'

/**
 * Answers are always rendered open — not in an accordion — so every answer is
 * in the server HTML for readers and crawlers alike, matching the FAQ schema.
 */
export function FaqSection({ faqs }: { faqs: CalculatorFaq[] }) {
  if (faqs.length === 0) return null

  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="mb-4 text-2xl font-semibold text-ink">
        Frequently Asked Questions
      </h2>
      <div className="divide-y divide-line border-y border-line">
        {faqs.map((faq) => (
          <div key={faq.question} className="py-4">
            <h3 className="font-semibold text-ink">{faq.question}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
