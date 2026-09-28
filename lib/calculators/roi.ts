import { money, num, round2, signedMoney } from './guards'

export interface RoiInput {
  initialInvestment: number
  finalValue: number
  /** Additional costs incurred: fees, commissions, maintenance. */
  additionalCosts?: number
  /** Income received during the holding period: dividends, rent, interest. */
  incomeReceived?: number
  /** Holding period in months. Enables the annualised figures. */
  holdingPeriodMonths?: number
}

export interface RoiResult {
  /** Total money put in: investment plus costs. */
  totalInvested: number
  /** Total money out: final value plus income. */
  totalReturned: number
  /** Absolute gain or loss. Negative on a loss. */
  netProfit: number
  /** Simple ROI as a percentage. Negative on a loss. */
  roi: number
  /** ROI restated as an equivalent annual rate. Zero without a holding period. */
  annualizedRoi: number
  /** Multiple of money returned, e.g. 1.5 means 1.5× the money back. */
  multiple: number
  /** Months needed to recover the outlay at the observed rate. */
  breakEvenMonths: number
  isProfit: boolean
  isValid: boolean
}

/**
 * Return on investment, with annualisation.
 *
 * Two subtleties worth noting. First, the denominator is total money invested
 * (outlay plus costs), not just the headline purchase price — ignoring fees
 * overstates ROI, sometimes badly. Second, annualising uses the geometric
 * formula rather than dividing by the number of years, because a 100% return
 * over two years is 41.4% a year, not 50%.
 */
export function calculateRoi(input: RoiInput): RoiResult {
  const initialInvestment = money(input.initialInvestment)
  // A final value can legitimately be zero (total loss) but not negative.
  const finalValue = money(input.finalValue)
  const additionalCosts = money(input.additionalCosts)
  const incomeReceived = money(input.incomeReceived)
  const holdingPeriodMonths = Math.min(Math.max(Math.floor(num(input.holdingPeriodMonths)), 0), 1200)

  const totalInvested = round2(initialInvestment + additionalCosts)
  const totalReturned = round2(finalValue + incomeReceived)
  const netProfit = round2(totalReturned - totalInvested)

  if (totalInvested <= 0) {
    return {
      totalInvested: 0,
      totalReturned,
      netProfit: 0,
      roi: 0,
      annualizedRoi: 0,
      multiple: 0,
      breakEvenMonths: 0,
      isProfit: false,
      isValid: false,
    }
  }

  const roi = round2((netProfit / totalInvested) * 100)
  const multiple = round2(totalReturned / totalInvested)

  // Annualised ROI: (1 + ROI)^(1/years) − 1. Undefined when the investment is a
  // total loss, since no annual rate reaches zero from a positive base.
  let annualizedRoi = 0
  if (holdingPeriodMonths > 0 && totalReturned > 0) {
    const holdingYears = holdingPeriodMonths / 12
    annualizedRoi = round2((Math.pow(totalReturned / totalInvested, 1 / holdingYears) - 1) * 100)
  }

  // Break-even: at the observed average monthly gain, when does cumulative
  // return cover the outlay? Only meaningful on a profitable position.
  let breakEvenMonths = 0
  if (holdingPeriodMonths > 0 && netProfit > 0) {
    const gainPerMonth = netProfit / holdingPeriodMonths
    breakEvenMonths = gainPerMonth > 0 ? Math.ceil(totalInvested / gainPerMonth) : 0
  }

  return {
    totalInvested,
    totalReturned,
    netProfit,
    roi,
    annualizedRoi,
    multiple,
    breakEvenMonths,
    isProfit: netProfit > 0,
    isValid: true,
  }
}

/**
 * Compound annual growth rate — the constant yearly rate that turns a beginning
 * value into an ending value over a given number of years.
 *
 *     CAGR = (end / begin)^(1/years) − 1
 *
 * Exported separately because CAGR is its own well-searched calculator and the
 * ROI page links to it.
 */
export function calculateCagr(beginValue: number, endValue: number, periodYears: number): number {
  const begin = money(beginValue)
  const end = money(endValue)
  const yearCount = Math.max(0, num(periodYears))

  if (begin <= 0 || yearCount <= 0 || end < 0) return 0
  if (end === 0) return -100
  return round2((Math.pow(end / begin, 1 / yearCount) - 1) * 100)
}

/**
 * Simple (non-compounding) interest: `I = P · r · t`.
 * Used by the simple-interest calculator and referenced in the guides.
 */
export function calculateSimpleInterest(
  principal: number,
  annualRatePercent: number,
  termYears: number
): { interest: number; total: number } {
  const p = money(principal)
  const r = signedMoney(annualRatePercent) / 100
  const t = Math.max(0, num(termYears))
  const interest = round2(p * r * t)
  return { interest, total: round2(p + interest) }
}
