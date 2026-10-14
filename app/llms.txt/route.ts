import { CALCULATORS } from '@/config/calculators'
import { GUIDES } from '@/config/guides'
import { FOOTER_LEGAL_LINKS, SITE } from '@/config/site'

// Rendered once at build time. Derived from the same registries as the sitemap
// so a new calculator or guide shows up here without a separate edit.
export const dynamic = 'force-static'

export function GET() {
  const lines = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description} ${SITE.disclaimerShort}`,
    '',
    '## Calculators',
    ...CALCULATORS.map((c) => `- [${c.name}](${SITE.url}/calculators/${c.slug}): ${c.summary}`),
    '',
    '## Guides',
    ...GUIDES.map((g) => `- [${g.title}](${SITE.url}/guides/${g.slug}): ${g.description}`),
    '',
    '## Optional',
    ...FOOTER_LEGAL_LINKS.map((l) => `- [${l.label}](${SITE.url}${l.href})`),
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
