import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

import { CALCULATORS, getCalculator, getRelatedCalculators } from '@/config/calculators'
import { getCategory } from '@/config/categories'
import { SITE } from '@/config/site'
import { AFFILIATE_PLACEMENTS } from '@/config/affiliate'
import { readCalculatorContent } from '@/lib/content/read-content'
import { mdxComponents } from '@/components/content/mdx-components'
import { EditorialByline } from '@/components/content/editorial-byline'
import { CALCULATOR_COMPONENTS } from '@/components/calculators/instances'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { breadcrumbSchema, calculatorWebApplicationSchema, faqSchema } from '@/lib/seo/schema'
import { FaqSection } from '@/components/calculators/faq-section'
import { RelatedCalculators } from '@/components/calculators/related-calculators'
import { AffiliateCardList } from '@/components/affiliate/affiliate-card'
import { AffiliateDisclosure } from '@/components/affiliate/affiliate-disclosure'

export function generateStaticParams() {
  return CALCULATORS.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<'/calculators/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const config = getCalculator(slug)
  if (!config) return {}

  return {
    // `config.seo.title` already includes the "| Calcxs" suffix, so it's
    // set as absolute — otherwise the root layout's title template would
    // append the brand name a second time.
    title: { absolute: config.seo.title },
    description: config.seo.description,
    keywords: config.seo.keywords,
    alternates: { canonical: `/calculators/${config.slug}` },
    openGraph: {
      title: config.seo.title,
      description: config.seo.description,
      url: `${SITE.url}/calculators/${config.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.seo.title,
      description: config.seo.description,
    },
  }
}

export default async function CalculatorPage({ params }: PageProps<'/calculators/[slug]'>) {
  const { slug } = await params
  const config = getCalculator(slug)
  if (!config) notFound()

  const category = getCategory(config.category)
  const related = getRelatedCalculators(config)
  const CalculatorComponent = CALCULATOR_COMPONENTS[config.slug]
  const source = await readCalculatorContent(config.slug)

  const breadcrumbItems = [
    { label: 'Calculators', href: '/calculators' },
    ...(category ? [{ label: category.name, href: `/category/${category.slug}` }] : []),
    { label: config.name, href: `/calculators/${config.slug}` },
  ]

  return (
    <div className="container-page py-8">
      <JsonLd data={calculatorWebApplicationSchema(config)} />
      <JsonLd data={breadcrumbSchema(breadcrumbItems)} />
      {config.faqs.length > 0 && <JsonLd data={faqSchema(config.faqs)} />}

      <Breadcrumbs items={breadcrumbItems} />

      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">{config.name}</h1>
        <p className="mt-2 text-lg text-ink-muted">{config.summary}</p>
        <EditorialByline updated={config.updated} />
      </header>

      {CalculatorComponent && <CalculatorComponent />}

      <article className="mt-12 max-w-3xl">
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

      <div className="mt-10 max-w-3xl space-y-10">
        <AffiliateCardList placements={AFFILIATE_PLACEMENTS} calculatorSlug={config.slug} />
        {AFFILIATE_PLACEMENTS.length > 0 && <AffiliateDisclosure />}
        <FaqSection faqs={config.faqs} />
        <RelatedCalculators calculators={related} />
      </div>
    </div>
  )
}
