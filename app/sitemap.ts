import type { MetadataRoute } from 'next'

import { CALCULATORS, assertRegistryIntegrity, getPopulatedCategorySlugs } from '@/config/calculators'
import { GUIDES } from '@/config/guides'
import { SITE } from '@/config/site'

// Runs at build time, before any URL is emitted — an inconsistent registry
// (a broken `related` slug, an unknown category) fails the build here rather
// than shipping a 404 (design spec §3.3).
assertRegistryIntegrity()

const STATIC_ROUTES = [
  { path: '/', changeFrequency: 'weekly' as const, priority: 1 },
  { path: '/calculators', changeFrequency: 'weekly' as const, priority: 0.9 },
  { path: '/guides', changeFrequency: 'weekly' as const, priority: 0.7 },
  { path: '/about', changeFrequency: 'yearly' as const, priority: 0.3 },
  { path: '/editorial-policy', changeFrequency: 'yearly' as const, priority: 0.3 },
  { path: '/changelog', changeFrequency: 'monthly' as const, priority: 0.3 },
  { path: '/disclaimer', changeFrequency: 'yearly' as const, priority: 0.3 },
  { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.3 },
  { path: '/contact', changeFrequency: 'yearly' as const, priority: 0.3 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${SITE.url}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...CALCULATORS.map((calc) => ({
      url: `${SITE.url}/calculators/${calc.slug}`,
      lastModified: new Date(calc.updated),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...getPopulatedCategorySlugs().map((slug) => ({
      url: `${SITE.url}/category/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...GUIDES.map((guide) => ({
      url: `${SITE.url}/guides/${guide.slug}`,
      lastModified: new Date(guide.updated),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
