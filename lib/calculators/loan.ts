import { buildAmortizationSchedule, type AmortizationRow } from './amortization'
import { money, periods, rate, round2 } from './guards'

export interface LoanInput {
  loanAmount: number
  /** Annual percentage rate, e.g. 7.5. */
  annualRate: number
  /** Term in months. Callers working in years should multiply by 12. */
  termMonths: number
  /** One-off origination or processing fee deducted from the disbursed amount. */
  originationFee?: number
  extraMonthlyPayment?: number
}

export interface LoanResult {
  monthlyPayment: number
  totalInterest: number
  totalPaid: number
  /** Loan amount minus any origination fee — the cash actually received. */
  amountDisbursed: number
  /**
   * The true annual cost including the origination fee. Equals the nominal rate
   * when there is no fee.
   */
  effectiveApr: number
  monthsToPayoff: number
  /** Interest as a share of the amount borrowed. */
  interestToPrincipalRatio: number
  schedule: AmortizationRow[]
  isValid: boolean
}

/**
 * Solves for the APR that makes the present value of the payment stream equal the
 * cash actually disbursed. There is no closed form, so this bisects on the rate.
 *
 * Bisection over a monotonic function on a bounded interval converges reliably in
 * well under 100 iterations, which matters because this runs on every keystroke.
 */
function solveEffectiveApr(disbursed: number, payment: number, termMonths: number): number {
  if (disbursed <= 0 || payment <= 0 || termMonths <= 0) return 0

  const presentValue = (monthlyRate: number): number => {
    if (monthlyRate === 0) return payment * termMonths
    return (payment * (1 - Math.pow(1 + monthlyRate, -termMonths))) / monthlyRate
  }

  // If even a zero rate cannot produce the disbursed amount the inputs are
  // inconsistent; report the nominal case rather than a nonsense root.
  if (presentValue(0) < disbursed) return 0

  let low = 0
  let high = 1 // 100% per month — far above any real consumer loan.

  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2
    if (presentValue(mid) > disbursed) {
      low = mid
    } else {
      high = mid
    }
    if (high - low < 1e-12) break
  }

  return round2(((low + high) / 2) * 12 * 100)
}

/**
 * General-purpose instalment loan calculator — auto, personal, student, business.
 *
 * Distinct from the mortgage engine in that it works in months rather than years
 * and models an origination fee, which raises the effective APR above the nominal
 * rate because the borrower pays interest on money they never received.
 */
export function calculateLoan(input: LoanInput): LoanResult {
  const loanAmount = money(input.loanAmount)
  const annualRate = rate(input.annualRate)
  const termMonths = periods(input.termMonths)
  const originationFee = Math.min(money(input.originationFee), loanAmount)
  const extraMonthlyPayment = money(input.extraMonthlyPayment)

  const amortization = buildAmortizationSchedule({
    principal: loanAmount,
    annualRate,
    totalPeriods: termMonths,
    extraMonthlyPayment,
  })

  const amountDisbursed = round2(loanAmount - originationFee)

  // The effective APR is measured against the scheduled payment, not an
  // overpaid one — overpaying changes the term, not the cost of credit.
  const scheduledPayment = buildAmortizationSchedule({
    principal: loanAmount,
    annualRate,
    totalPeriods: termMonths,
  }).monthlyPayment

  const effectiveApr =
    originationFee > 0
      ? solveEffectiveApr(amountDisbursed, scheduledPayment, termMonths)
      : round2(annualRate)

  return {
    monthlyPayment: amortization.monthlyPayment,
    totalInterest: amortization.totalInterest,
    totalPaid: amortization.totalPaid,
    amountDisbursed,
    effectiveApr,
    monthsToPayoff: amortization.actualPeriods,
    interestToPrincipalRatio:
      loanAmount > 0 ? round2((amortization.totalInterest / loanAmount) * 100) : 0,
    schedule: amortization.rows,
    isValid: loanAmount > 0 && termMonths > 0,
  }
}
