import { SITE } from '@/config/site'
import { OG_SIZE, renderOgImage } from '@/lib/seo/og-image'

export const alt = `${SITE.name} — free financial calculators`
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  return renderOgImage({
    eyebrow: 'Free financial calculators',
    title: 'Make money decisions with real numbers',
    subtitle: 'Mortgage, loan, salary, investment, debt and real estate calculators.',
  })
}
