export interface CategoryConfig {
  slug: string
  name: string
  description: string
}

/**
 * The full category taxonomy from the product brief (§3). Not every category
 * has an MVP calculator yet — `business` currently has none. The route layer
 * (`app/category/[slug]`) only statically generates a page for categories that
 * have at least one calculator in the registry, so an empty category never
 * ships as a page (brief §29's "no thin pages" rule), while the taxonomy below
 * stays the single source of truth for when calculators are added later.
 */
export const CATEGORIES = {
  'loans-mortgages': {
    slug: 'loans-mortgages',
    name: 'Loans & Mortgages',
    description:
      'Calculate mortgage payments, loan costs, and amortization schedules for homes, cars, and more.',
  },
  investment: {
    slug: 'investment',
    name: 'Investments',
    description:
      'Project investment growth, compound interest, retirement savings, and returns.',
  },
  debt: {
    slug: 'debt',
    name: 'Debt',
    description: 'Plan how to pay off credit cards and other debt as fast as possible.',
  },
  'salary-income': {
    slug: 'salary-income',
    name: 'Salary & Income',
    description: 'Convert pay between hourly and salary, and estimate your take-home pay.',
  },
  'real-estate': {
    slug: 'real-estate',
    name: 'Real Estate',
    description: 'Compare renting against buying and evaluate real estate decisions.',
  },
  business: {
    slug: 'business',
    name: 'Business',
    description: 'Margin, markup, break-even, and other calculators for running a business.',
  },
} as const satisfies Record<string, CategoryConfig>

export type CategorySlug = keyof typeof CATEGORIES

export function getCategory(slug: string): CategoryConfig | undefined {
  return (CATEGORIES as Record<string, CategoryConfig>)[slug]
}
