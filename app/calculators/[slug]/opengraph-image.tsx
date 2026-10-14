import { CALCULATORS, getCalculator } from '@/config/calculators'
import { getCategory } from '@/config/categories'
import { OG_SIZE, renderOgImage } from '@/lib/seo/og-image'

export const alt = 'Calculator preview'
export const size = OG_SIZE
export const contentType = 'image/png'

export function generateStaticParams() {
  return CALCULATORS.map((c) => ({ slug: c.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const config = getCalculator(slug)

  return renderOgImage({
    eyebrow: (config && getCategory(config.category)?.name) ?? 'Calculator',
    title: config?.name ?? 'Financial Calculator',
    subtitle: config?.summary,
  })
}
