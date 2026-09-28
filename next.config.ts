import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Recharts and the Radix primitives are large barrel exports; tree-shaking
  // them per-import keeps the calculator widget bundles small.
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
  },
  async redirects() {
    return [
      // The category landing pages are the canonical browse surface; /categories
      // and /calculator (singular) are common mistyped entry points.
      { source: '/categories', destination: '/calculators', permanent: true },
      { source: '/calculator', destination: '/calculators', permanent: true },
    ]
  },
}

export default nextConfig
