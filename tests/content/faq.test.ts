import { describe, expect, it } from 'vitest'
import { CALCULATORS } from '@/config/calculators'
import { GUIDES } from '@/config/guides'
import { readGuideContent } from '@/lib/content/read-content'

const MIN_FAQS = 4

/** The lines between "## Frequently Asked Questions" and the next "## " heading. */
function faqSection(mdx: string): string[] | null {
  const lines = mdx.split('\n')
  const start = lines.findIndex((l) => l.trim() === '## Frequently Asked Questions')
  if (start === -1) return null
  const end = lines.findIndex((l, i) => i > start && l.startsWith('## '))
  return lines.slice(start + 1, end === -1 ? undefined : end)
}

describe('every calculator has an FAQ', () => {
  it.each(CALCULATORS.map((c) => [c.slug, c] as const))('%s', (_, config) => {
    expect(config.faqs.length).toBeGreaterThanOrEqual(MIN_FAQS)
    for (const faq of config.faqs) {
      expect(faq.question.trim()).toMatch(/\?$/)
      expect(faq.answer.trim().length).toBeGreaterThan(40)
    }
  })
})

describe('every guide has an FAQ', () => {
  it.each(GUIDES.map((g) => [g.slug] as const))('%s', async (slug) => {
    const mdx = await readGuideContent(slug)
    const section = faqSection(mdx)
    expect(section, 'missing "## Frequently Asked Questions"').not.toBeNull()

    // Each entry is a paragraph opening with a bold question followed by its
    // answer, e.g. "**Is X?** Answer." — the question may wrap across lines.
    const paragraphs = section!.join('\n').split(/\n\s*\n/).map((p) => p.replace(/\s+/g, ' ').trim())
    const questions = paragraphs.filter((p) => /^\*\*[^*]+\?\*\* \S/.test(p))
    expect(questions.length).toBeGreaterThanOrEqual(MIN_FAQS)

    // The FAQ sits before the sources list, as on every other guide.
    expect(mdx.indexOf('## Frequently Asked Questions')).toBeLessThan(mdx.indexOf('## Sources'))
  })
})
