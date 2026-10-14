import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Recharts and the Radix primitives are large barrel exports; tree-shaking
  // them per-import keeps the calculator widget bundles small.
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
  },
  async redirects() {
    return [
      // One canonical host: bare-domain requests go to www so search engines
      // never index two copies of the site. Only matches the apex host.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'calcxs.site' }],
        destination: 'https://www.calcxs.site/:path*',
        permanent: true,
      },
      // The category landing pages are the canonical browse surface; /categories
      // and /calculator (singular) are common mistyped entry points.
      { source: '/categories', destination: '/calculators', permanent: true },
      { source: '/calculator', destination: '/calculators', permanent: true },
    ]
  },
}

export default nextConfig
