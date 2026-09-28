import type { MetadataRoute } from 'next'

import { SITE } from '@/config/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /search is a utility view over data already indexable via /calculators
      // and each calculator's own page — indexing it would only create
      // duplicate, parameterized content (brief §20).
      disallow: '/search',
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  }
}
