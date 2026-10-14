import { money, rate, round2, signedRate } from './guards'
import { PAY_FREQUENCIES, type PayFrequency } from '../tax/us-federal-2026'

export type RaiseType = 'percent' | 'amount'

export interface RaiseInput {
  /** Current gross annual salary. */
  currentSalary: number
  /** Whether the raise is given as a percentage or a dollar amount. */
  raiseType: RaiseType
  /** Raise as a percentage of current salary. Used when `raiseType` is `percent`. */
  raisePercent?: number
  /** Raise as an annual dollar amount. Used when `raiseType` is `amount`. */
  raiseAmount?: number
  /** How often the paycheck arrives, for the per-paycheck increase. */
  payFrequency?: PayFrequency
  /** Annual inflation, to judge whether the raise beats rising prices. */
  inflationRate?: number
}

export interface RaiseResult {
  newSalary: number
  raiseAmount: number
  /** Nominal raise as a percentage of the old salary. */
  raisePercent: number
  monthlyIncrease: number
  perPaycheckIncrease: number
  newPerPaycheck: number
  /** Raise after inflation: (1 + nominal) / (1 + inflation) − 1, as a percentage. */
  realRaisePercent: number
  /** The new salary restated in today's purchasing power. */
  realNewSalary: number
  /** True when the raise at least keeps pace with inflation. */
  beatsInflation: boolean
  isValid: boolean
}

/**
 * New salary after a raise, plus whether that raise outpaces inflation.
 *
 * The real raise uses the exact Fisher relation rather than the common
 * "nominal minus inflation" shortcut, which overstates the real gain slightly
 * and diverges noticeably once either rate is large.
 */
export function calculateRaise(input: RaiseInput): RaiseResult {
  const currentSalary = money(input.currentSalary)
  const inflationRate = signedRate(input.inflationRate)
  const periodsPerYear = PAY_FREQUENCIES[input.payFrequency ?? 'biweekly'] ?? 26

  const raiseAmount =
    input.raiseType === 'amount'
      ? money(input.raiseAmount)
      : currentSalary * (rate(input.raisePercent) / 100)

  const newSalary = currentSalary + raiseAmount
  const nominal = currentSalary > 0 ? raiseAmount / currentSalary : 0

  // Inflation of −100% or below has no meaning; fall back to the nominal figure.
  const inflationFactor = 1 + inflationRate / 100
  const real = inflationFactor > 0 ? (1 + nominal) / inflationFactor - 1 : nominal

  return {
    newSalary: round2(newSalary),
    raiseAmount: round2(raiseAmount),
    raisePercent: round2(nominal * 100),
    monthlyIncrease: round2(raiseAmount / 12),
    perPaycheckIncrease: round2(raiseAmount / periodsPerYear),
    newPerPaycheck: round2(newSalary / periodsPerYear),
    realRaisePercent: round2(real * 100),
    realNewSalary: round2(inflationFactor > 0 ? newSalary / inflationFactor : newSalary),
    beatsInflation: real >= 0,
    isValid: currentSalary > 0,
  }
}
