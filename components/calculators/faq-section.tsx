import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import type { CalculatorFaq } from '@/config/calculators/types'

export function FaqSection({ faqs }: { faqs: CalculatorFaq[] }) {
  if (faqs.length === 0) return null

  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="mb-4 text-2xl font-semibold text-ink">
        Frequently Asked Questions
      </h2>
      <Accordion type="single" collapsible>
        {faqs.map((faq, index) => (
          <AccordionItem key={faq.question} value={`faq-${index}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
