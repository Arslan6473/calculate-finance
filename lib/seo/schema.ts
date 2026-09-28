import { SITE } from '@/config/site'
import type { CalculatorConfig, CalculatorFaq } from '@/config/calculators/types'
import type { GuideConfig } from '@/config/guides'

/**
 * JSON-LD builders. Kept as pure functions returning plain objects — the
 * `<JsonLd>` component only serializes, so these are trivial to unit test and
 * reuse between the calculator and guide routes.
 *
 * Per brief §21: only schema that accurately represents visible page content.
 * No `AggregateRating`, no fabricated reviews.
 */

export function breadcrumbSchema(items: Array<{ label: string; href: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${SITE.url}${item.href}`,
    })),
  }
}

export function faqSchema(faqs: CalculatorFaq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}

export function calculatorWebApplicationSchema(config: CalculatorConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: config.name,
    url: `${SITE.url}/calculators/${config.slug}`,
    description: config.summary,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }
}

export function guideArticleSchema(guide: GuideConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    url: `${SITE.url}/guides/${guide.slug}`,
    publisher: { '@type': 'Organization', name: SITE.name },
  }
}
