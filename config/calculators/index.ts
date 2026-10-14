import { CATEGORIES } from '../categories'
import { autoLoanConfig } from './autoLoan'
import { cagrConfig } from './cagr'
import { compoundInterestConfig } from './compoundInterest'
import { creditCardConfig } from './creditCard'
import { debtPayoffConfig } from './debtPayoff'
import { debtToIncomeConfig } from './debtToIncome'
import { homeAffordabilityConfig } from './homeAffordability'
import { hourlyToSalaryConfig } from './hourlyToSalary'
import { inflationConfig } from './inflation'
import { investmentConfig } from './investment'
import { loanConfig } from './loan'
import { mortgageConfig } from './mortgage'
import { overtimeConfig } from './overtime'
import { raiseConfig } from './raise'
import { refinanceConfig } from './refinance'
import { rentAffordabilityConfig } from './rentAffordability'
import { rentalPropertyConfig } from './rentalProperty'
import { rentVsBuyConfig } from './rentVsBuy'
import { retirementConfig } from './retirement'
import { roiConfig } from './roi'
import { salaryConfig } from './salary'
import { savingsGoalConfig } from './savingsGoal'
import type { CalculatorConfig } from './types'

/**
 * The calculator registry — the single source of truth described in the
 * design spec §3.3. Routes, the sitemap, the search index, category pages, and
 * the homepage's popular-calculators list all derive from this list rather than
 * being maintained separately, so adding a calculator here makes it appear
 * everywhere automatically.
 */
export const CALCULATORS: CalculatorConfig[] = [
  mortgageConfig,
  loanConfig,
  autoLoanConfig,
  refinanceConfig,
  compoundInterestConfig,
  investmentConfig,
  savingsGoalConfig,
  inflationConfig,
  cagrConfig,
  roiConfig,
  retirementConfig,
  salaryConfig,
  hourlyToSalaryConfig,
  raiseConfig,
  overtimeConfig,
  debtPayoffConfig,
  debtToIncomeConfig,
  creditCardConfig,
  rentVsBuyConfig,
  homeAffordabilityConfig,
  rentAffordabilityConfig,
  rentalPropertyConfig,
]

const bySlug = new Map(CALCULATORS.map((c) => [c.slug, c]))

export function getCalculator(slug: string): CalculatorConfig | undefined {
  return bySlug.get(slug)
}

export function getCalculatorsByCategory(categorySlug: string): CalculatorConfig[] {
  return CALCULATORS.filter((c) => c.category === categorySlug)
}

export function getRelatedCalculators(config: CalculatorConfig): CalculatorConfig[] {
  return config.related.map((slug) => bySlug.get(slug)).filter((c): c is CalculatorConfig => !!c)
}

/**
 * Category slugs that actually have at least one calculator. `app/category/
 * [slug]/page.tsx` generates static params from this, not from the full
 * `CATEGORIES` taxonomy — so a category with nothing in it yet (currently
 * `business`) never ships as a page. See `config/categories.ts`.
 */
export function getPopulatedCategorySlugs(): string[] {
  const populated = new Set(CALCULATORS.map((c) => c.category))
  return Object.keys(CATEGORIES).filter((slug) => populated.has(slug as never))
}

/**
 * Fails the build if the registry is internally inconsistent — a `related`
 * slug that does not resolve, or a category that does not exist. This is what
 * turns "no broken links" (brief §31) from a hope into an enforced invariant.
 * Called from a route module during the build so the failure surfaces as a
 * build error, not a 404 discovered later.
 */
export function assertRegistryIntegrity(): void {
  const errors: string[] = []
  const slugs = new Set(CALCULATORS.map((c) => c.slug))

  if (slugs.size !== CALCULATORS.length) {
    errors.push('Duplicate calculator slug detected in the registry.')
  }

  for (const config of CALCULATORS) {
    if (!(config.category in CATEGORIES)) {
      errors.push(`Calculator "${config.slug}" references unknown category "${config.category}".`)
    }
    for (const relatedSlug of config.related) {
      if (!slugs.has(relatedSlug)) {
        errors.push(`Calculator "${config.slug}" links to unknown related slug "${relatedSlug}".`)
      }
      if (relatedSlug === config.slug) {
        errors.push(`Calculator "${config.slug}" lists itself as related.`)
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Calculator registry integrity check failed:\n- ${errors.join('\n- ')}`)
  }
}
