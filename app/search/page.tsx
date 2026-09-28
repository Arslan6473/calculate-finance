import type { Metadata } from 'next'

import { SearchClient } from '@/components/search/search-client'

export const metadata: Metadata = {
  title: 'Search Calculators',
  robots: { index: false, follow: true },
}

export default async function SearchPage({ searchParams }: PageProps<'/search'>) {
  const params = await searchParams
  const rawQuery = params.q
  const query = typeof rawQuery === 'string' ? rawQuery : Array.isArray(rawQuery) ? rawQuery[0] : ''

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-3xl font-bold text-ink">Search Calculators</h1>
      <SearchClient initialQuery={query ?? ''} />
    </div>
  )
}
