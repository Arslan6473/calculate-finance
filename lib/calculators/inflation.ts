import { money, round2, signedRate, years } from './guards'

/**
 * `future` — what today's amount will cost, and be worth, after N years.
 * `past` — what today's amount was equivalent to N years ago.
 */
export type InflationMode = 'future' | 'past'

export interface InflationInput {
  amount: number
  /** Assumed constant annual inflation as a percentage, e.g. 3. May be negative (deflation). */
  inflationRate: number
  /** Whole years forward or back. */
  termYears: number
  mode?: InflationMode
}

export interface InflationYear {
  year: number
  /** amount × (1 + r)^year — the price of the same goods after `year` years. */
  grownValue: number
  /** amount ÷ (1 + r)^year — the amount discounted by `year` years of inflation. */
  discountedValue: number
}

export interface InflationResult {
  /** amount × (1 + r)^n. In `future` mode: the future cost of what the amount buys today. */
  grownValue: number
  /**
   * amount ÷ (1 + r)^n. In `future` mode: the purchasing power of the amount in
   * the future, in today's dollars. In `past` mode: what the amount was
   * equivalent to N years ago.
   */
  discountedValue: number
  /** Total price increase over the period: (1 + r)^n − 1, as a percentage. */
  cumulativeInflation: number
  /** Share of purchasing power lost over the period: 1 − 1/(1 + r)^n, as a percentage. */
  purchasingPowerLoss: number
  yearly: InflationYear[]
  isValid: boolean
}

/**
 * Constant-rate inflation, projected forward or back.
 *
 * Deliberately uses a single assumed rate rather than historical CPI tables:
 * a hard-coded table goes stale every month and cannot be verified at a glance,
 * whereas a rate the user chooses is transparent. Both directions are the same
 * compounding factor (1 + r)^n, applied by multiplication or division.
 */
export function calculateInflation(input: InflationInput): InflationResult {
  const amount = money(input.amount)
  const inflationRate = signedRate(input.inflationRate)
  const termYears = years(input.termYears)

  const yearlyFactor = 1 + inflationRate / 100

  // Inflation of −100% or below has no meaning (prices cannot fall to zero or below).
  if (yearlyFactor <= 0 || termYears <= 0 || amount <= 0) {
    return {
      grownValue: round2(amount),
      discountedValue: round2(amount),
      cumulativeInflation: 0,
      purchasingPowerLoss: 0,
      yearly: [],
      isValid: false,
    }
  }

  const factor = Math.pow(yearlyFactor, termYears)

  const yearly: InflationYear[] = []
  for (let year = 0; year <= termYears; year++) {
    const f = Math.pow(yearlyFactor, year)
    yearly.push({
      year,
      grownValue: round2(amount * f),
      discountedValue: round2(amount / f),
    })
  }

  return {
    grownValue: round2(amount * factor),
    discountedValue: round2(amount / factor),
    cumulativeInflation: round2((factor - 1) * 100),
    purchasingPowerLoss: round2((1 - 1 / factor) * 100),
    yearly,
    isValid: true,
  }
}
