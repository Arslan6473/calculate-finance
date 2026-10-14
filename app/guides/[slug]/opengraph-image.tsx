import { GUIDES, getGuide } from '@/config/guides'
import { OG_SIZE, renderOgImage } from '@/lib/seo/og-image'

export const alt = 'Guide preview'
export const size = OG_SIZE
export const contentType = 'image/png'

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = getGuide(slug)

  return renderOgImage({
    eyebrow: 'Guide',
    title: guide?.title ?? 'Personal Finance Guide',
  })
}
