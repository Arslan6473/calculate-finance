import { buildAmortizationSchedule } from './amortization'
import { money, rate, round2, years } from './guards'

export interface RefinanceInput {
  /** Principal still owed on the current mortgage. */
  currentBalance: number
  /** Current annual rate, e.g. 7.5. */
  currentRate: number
  /** Years left on the current mortgage. */
  remainingYears: number
  /** New annual rate, e.g. 6.25. */
  newRate: number
  /** Term of the new loan in years. */
  newTermYears: number
  closingCosts?: number
  /** When true, closing costs are added to the new loan balance instead of paid in cash. */
  rollCostsIntoLoan?: boolean
}

export interface RefinanceResult {
  currentMonthlyPayment: number
  newMonthlyPayment: number
  newLoanAmount: number
  /** Current payment minus new payment. Negative when the new payment is higher. */
  monthlySavings: number
  /**
   * Months until cumulative payment savings repay the closing costs. `null` when
   * the new payment is not lower, so the costs are never recovered.
   */
  breakEvenMonths: number | null
  currentTotalInterest: number
  newTotalInterest: number
  /** Every remaining payment on the current loan. */
  currentTotalPaid: number
  /** Every payment on the new loan plus closing costs paid in cash. */
  newTotalCost: number
  /** currentTotalPaid − newTotalCost. Negative means the refinance costs more overall. */
  lifetimeNetSavings: number
  /** New term in months minus months remaining — positive when the payoff date moves later. */
  termExtensionMonths: number
  isValid: boolean
}

/**
 * Compares keeping a mortgage against refinancing it.
 *
 * The monthly saving and the lifetime saving answer different questions. A new
 * 30-year loan on a balance with 27 years left lowers the payment partly by
 * stretching it over three more years, so the comparison that matters is total
 * cash out the door: all remaining payments on the old loan against all payments
 * on the new one plus any closing costs paid upfront. When costs are rolled into
 * the loan they are already inside the new payments, so they are not added again.
 */
export function calculateRefinance(input: RefinanceInput): RefinanceResult {
  const currentBalance = money(input.currentBalance)
  const currentRate = rate(input.currentRate)
  const remainingMonths = years(input.remainingYears) * 12
  const newRate = rate(input.newRate)
  const newTermMonths = years(input.newTermYears) * 12
  const closingCosts = money(input.closingCosts)
  const rollCostsIntoLoan = input.rollCostsIntoLoan ?? false

  const newLoanAmount = round2(currentBalance + (rollCostsIntoLoan ? closingCosts : 0))

  const current = buildAmortizationSchedule({
    principal: currentBalance,
    annualRate: currentRate,
    totalPeriods: remainingMonths,
  })
  const next = buildAmortizationSchedule({
    principal: newLoanAmount,
    annualRate: newRate,
    totalPeriods: newTermMonths,
  })

  const isValid = currentBalance > 0 && remainingMonths > 0 && newTermMonths > 0

  const monthlySavings = round2(current.monthlyPayment - next.monthlyPayment)
  let breakEvenMonths: number | null = null
  if (monthlySavings > 0) {
    breakEvenMonths = closingCosts > 0 ? Math.ceil(closingCosts / monthlySavings) : 0
  }

  const newTotalCost = round2(next.totalPaid + (rollCostsIntoLoan ? 0 : closingCosts))

  return {
    currentMonthlyPayment: isValid ? current.monthlyPayment : 0,
    newMonthlyPayment: isValid ? next.monthlyPayment : 0,
    newLoanAmount,
    monthlySavings: isValid ? monthlySavings : 0,
    breakEvenMonths: isValid ? breakEvenMonths : null,
    currentTotalInterest: current.totalInterest,
    newTotalInterest: next.totalInterest,
    currentTotalPaid: current.totalPaid,
    newTotalCost,
    lifetimeNetSavings: isValid ? round2(current.totalPaid - newTotalCost) : 0,
    termExtensionMonths: newTermMonths - remainingMonths,
    isValid,
  }
}
