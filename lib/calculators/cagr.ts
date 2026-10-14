import { MAX_MONEY, num, round2, signedMoney } from './guards'
import { calculateCagr as cagrPercent } from './roi'

/** Longest period the calculator accepts, in years. */
export const MAX_CAGR_YEARS = 100

export interface CagrInput {
  beginValue: number
  endValue: number
  /** Length of the period in years. Fractional values are allowed, e.g. 2.5. */
  periodYears: number
}

export interface CagrPoint {
  /** Years from the start. Whole years, plus the final fractional year if any. */
  year: number
  /** Value on the smoothed path: begin × (1 + CAGR)^year. */
  value: number
}

export interface CagrResult {
  /** Compound annual growth rate as a percentage. */
  cagr: number
  /** Total return over the whole period as a percentage. */
  totalReturn: number
  /** Ending value minus beginning value. Negative on a loss. */
  absoluteGain: number
  /** Ending value ÷ beginning value, e.g. 2.5 means 2.5× the money. */
  multiple: number
  /** The constant-rate path from beginning to ending value, for the chart. */
  path: CagrPoint[]
  isGain: boolean
  isValid: boolean
}

/**
 * Compound annual growth rate with a smoothed year-by-year path.
 *
 *     CAGR = (end / begin)^(1/years) − 1
 *
 * The headline percentage reuses `calculateCagr` from the ROI engine so both
 * pages always agree. CAGR is undefined for a non-positive beginning value
 * (there is nothing to grow from) and for a negative ending value (no real
 * rate reaches a negative number from a positive one), so those inputs return
 * an invalid result rather than a misleading number.
 */
export function calculateCagrDetails(input: CagrInput): CagrResult {
  const beginValue = signedMoney(input.beginValue)
  const endValue = signedMoney(input.endValue)
  const periodYears = Math.min(Math.max(num(input.periodYears), 0), MAX_CAGR_YEARS)

  if (beginValue <= 0 || endValue < 0 || periodYears <= 0) {
    return {
      cagr: 0,
      totalReturn: 0,
      absoluteGain: 0,
      multiple: 0,
      path: [],
      isGain: false,
      isValid: false,
    }
  }

  const ratio = endValue / beginValue

  const path: CagrPoint[] = []
  const wholeYears = Math.floor(periodYears)
  for (let year = 0; year <= wholeYears; year++) {
    path.push({ year, value: pathValue(beginValue, ratio, year / periodYears) })
  }
  if (periodYears > wholeYears) {
    path.push({ year: round2(periodYears), value: round2(endValue) })
  }

  return {
    cagr: cagrPercent(beginValue, endValue, periodYears),
    totalReturn: round2((ratio - 1) * 100),
    absoluteGain: round2(endValue - beginValue),
    multiple: round2(ratio),
    path,
    isGain: endValue > beginValue,
    isValid: true,
  }
}

/** begin × ratio^fraction, guarded against overflow. 0^0 is 1, so year 0 is always the beginning value. */
function pathValue(begin: number, ratio: number, fraction: number): number {
  const value = begin * Math.pow(ratio, fraction)
  return round2(Number.isFinite(value) ? Math.min(value, MAX_MONEY) : MAX_MONEY)
}
