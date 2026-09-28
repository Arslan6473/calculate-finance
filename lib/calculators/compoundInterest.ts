import { MAX_MONEY, money, round2, signedRate, years } from './guards'

/** How often interest is added to the balance. */
export const COMPOUND_FREQUENCIES = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
} as const

export type CompoundFrequency = keyof typeof COMPOUND_FREQUENCIES

/** How often the saver adds money. Independent of the compounding frequency. */
export const CONTRIBUTION_FREQUENCIES = {
  monthly: 12,
  quarterly: 4,
  annually: 1,
} as const

export type ContributionFrequency = keyof typeof CONTRIBUTION_FREQUENCIES

export interface CompoundInterestInput {
  principal: number
  /** Annual interest rate as a percentage, e.g. 7. May be negative. */
  annualRate: number
  termYears: number
  compoundFrequency: CompoundFrequency
  /** Recurring deposit amount. */
  contribution?: number
  contributionFrequency?: ContributionFrequency
  /** Deposit at the start of each period rather than the end. */
  contributeAtStart?: boolean
}

export interface CompoundInterestYear {
  year: number
  /** Balance at the end of this year. */
  balance: number
  /** Cumulative deposits including the opening principal. */
  totalContributed: number
  /** Cumulative interest earned. */
  totalInterest: number
  /** Interest earned during this year alone. */
  interestThisYear: number
}

export interface CompoundInterestResult {
  finalBalance: number
  totalContributed: number
  totalInterest: number
  /** Interest as a share of the final balance. */
  interestShare: number
  /**
   * The constant annual rate that would produce the same result. Equals the
   * nominal rate when compounding annually, higher otherwise.
   */
  effectiveAnnualRate: number
  yearly: CompoundInterestYear[]
  isValid: boolean
}

/**
 * Compound interest with optional recurring contributions.
 *
 * Rather than applying a closed-form future-value formula, this steps period by
 * period. That is necessary because the compounding and contribution frequencies
 * are independent — someone can deposit monthly into an account that compounds
 * quarterly — and it produces the year-by-year series the chart needs as a
 * by-product rather than requiring a second pass.
 */
export function calculateCompoundInterest(
  input: CompoundInterestInput
): CompoundInterestResult {
  const principal = money(input.principal)
  const annualRate = signedRate(input.annualRate)
  const termYears = years(input.termYears)
  const contribution = money(input.contribution)

  const compoundsPerYear = COMPOUND_FREQUENCIES[input.compoundFrequency] ?? 12
  const contributionsPerYear =
    CONTRIBUTION_FREQUENCIES[input.contributionFrequency ?? 'monthly'] ?? 12
  const contributeAtStart = input.contributeAtStart ?? false

  const empty: CompoundInterestResult = {
    finalBalance: round2(principal),
    totalContributed: round2(principal),
    totalInterest: 0,
    interestShare: 0,
    effectiveAnnualRate: 0,
    yearly: [],
    isValid: false,
  }
  if (termYears <= 0 || (principal <= 0 && contribution <= 0)) return empty

  // Step at the finer of the two frequencies so neither is approximated.
  const stepsPerYear = Math.max(compoundsPerYear, contributionsPerYear)
  const ratePerCompound = annualRate / 100 / compoundsPerYear

  let balance = principal
  let totalContributed = principal
  let totalInterest = 0

  const yearly: CompoundInterestYear[] = []

  for (let year = 1; year <= termYears; year++) {
    const interestAtYearStart = totalInterest

    for (let step = 1; step <= stepsPerYear; step++) {
      const isContributionStep =
        Math.floor((step * contributionsPerYear) / stepsPerYear) >
        Math.floor(((step - 1) * contributionsPerYear) / stepsPerYear)

      const isCompoundStep =
        Math.floor((step * compoundsPerYear) / stepsPerYear) >
        Math.floor(((step - 1) * compoundsPerYear) / stepsPerYear)

      if (isContributionStep && contributeAtStart && contribution > 0) {
        balance += contribution
        totalContributed += contribution
      }

      if (isCompoundStep && ratePerCompound !== 0) {
        const interest = balance * ratePerCompound
        balance += interest
        totalInterest += interest
      }

      if (isContributionStep && !contributeAtStart && contribution > 0) {
        balance += contribution
        totalContributed += contribution
      }

      // A sustained high rate over a long term can overflow; cap rather than
      // return Infinity to the UI.
      if (balance > MAX_MONEY) {
        balance = MAX_MONEY
        break
      }
      // A negative rate can drive the balance below zero, which is not meaningful
      // for a savings account.
      if (balance < 0) balance = 0
    }

    yearly.push({
      year,
      balance: round2(balance),
      totalContributed: round2(totalContributed),
      totalInterest: round2(totalInterest),
      interestThisYear: round2(totalInterest - interestAtYearStart),
    })
  }

  const finalBalance = round2(balance)

  return {
    finalBalance,
    totalContributed: round2(totalContributed),
    totalInterest: round2(totalInterest),
    interestShare: finalBalance > 0 ? round2((totalInterest / finalBalance) * 100) : 0,
    effectiveAnnualRate:
      ratePerCompound === 0
        ? 0
        : round2((Math.pow(1 + ratePerCompound, compoundsPerYear) - 1) * 100),
    yearly,
    isValid: true,
  }
}
