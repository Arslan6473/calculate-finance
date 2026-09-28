import { CALCULATORS } from '@/config/calculators'
import { CATEGORIES } from '@/config/categories'
import type { CalculatorConfig } from '@/config/calculators/types'

/**
 * A plain substring search over the calculator registry. At ten (eventually
 * a few dozen) calculators, this is fast enough without a search library —
 * revisit only if the registry grows into the hundreds.
 */
export function searchCalculators(query: string): CalculatorConfig[] {
  const q = query.trim().toLowerCase()
  if (!q) return CALCULATORS

  return CALCULATORS.filter((calc) => {
    const haystack = [calc.name, calc.summary, CATEGORIES[calc.category].name, ...calc.seo.keywords]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}
