import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

import { GUIDES, getGuide } from '@/config/guides'
import { getCalculator } from '@/config/calculators'
import { SITE } from '@/config/site'
import { readGuideContent } from '@/lib/content/read-content'
import { mdxComponents } from '@/components/content/mdx-components'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { breadcrumbSchema, guideArticleSchema } from '@/lib/seo/schema'
import { RelatedCalculators } from '@/components/calculators/related-calculators'

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: PageProps<'/guides/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) return {}

  return {
    // `guide.seo.title` already includes the "Calcxs Guides" suffix, so
    // it's set as absolute — see the same note on the calculator page.
    title: { absolute: guide.seo.title },
    description: guide.seo.description,
    keywords: guide.seo.keywords,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: guide.seo.title,
      description: guide.seo.description,
      url: `${SITE.url}/guides/${guide.slug}`,
      type: 'article',
    },
  }
}

export default async function GuidePage({ params }: PageProps<'/guides/[slug]'>) {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) notFound()

  const source = await readGuideContent(guide.slug)
  const related = guide.relatedCalculators
    .map((s) => getCalculator(s))
    .filter((c): c is NonNullable<typeof c> => !!c)

  const breadcrumbItems = [
    { label: 'Guides', href: '/guides' },
    { label: guide.title, href: `/guides/${guide.slug}` },
  ]

  return (
    <div className="container-page py-8">
      <JsonLd data={guideArticleSchema(guide)} />
      <JsonLd data={breadcrumbSchema(breadcrumbItems)} />

      <Breadcrumbs items={breadcrumbItems} />

      <article className="max-w-3xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-ink sm:text-4xl">{guide.title}</h1>
          <p className="mt-2 text-lg text-ink-muted">{guide.description}</p>
        </header>

        <MDXRemote
          source={source}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
            },
          }}
        />
      </article>

      <div className="mt-10 max-w-3xl">
        <RelatedCalculators calculators={related} />
      </div>
    </div>
  )
}
