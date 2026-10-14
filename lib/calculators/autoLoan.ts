import { buildAmortizationSchedule, type AmortizationRow } from './amortization'
import { money, periods, rate, round2 } from './guards'

export interface AutoLoanInput {
  vehiclePrice: number
  downPayment?: number
  /** What the dealer pays for your current car. */
  tradeInValue?: number
  /** Loan balance still owed on the trade-in. */
  tradeInOwed?: number
  /** Sales tax rate as a percentage, e.g. 7. */
  salesTaxRate?: number
  /** Title, registration and documentation fees. */
  fees?: number
  /** When true, sales tax and fees are added to the loan instead of paid upfront. */
  financeTaxAndFees?: boolean
  /** Annual percentage rate, e.g. 7. */
  annualRate: number
  termMonths: number
}

export interface AutoLoanResult {
  monthlyPayment: number
  /** Total principal borrowed. */
  amountFinanced: number
  totalInterest: number
  /** Sum of every loan payment. */
  totalOfPayments: number
  /** Down payment + any tax and fees paid upfront + every loan payment. */
  totalCost: number
  /** Price minus trade-in value — the base sales tax is charged on. */
  taxableAmount: number
  salesTax: number
  fees: number
  /** Cash due at signing: down payment plus tax and fees when not financed. */
  upfrontCash: number
  /** Trade-in loan balance above the trade-in value, added to the new loan. */
  negativeEquity: number
  /** Trade-in value above the loan balance, which reduces the amount financed. */
  tradeInEquity: number
  schedule: AmortizationRow[]
  isValid: boolean
}

/**
 * Prices a car purchase loan the way a dealer worksheet does.
 *
 * Sales tax is charged on the price *after* the trade-in credit — the rule in
 * most US states, though not all. A trade-in worth less than its outstanding
 * loan leaves negative equity, which is rolled into the new loan; one worth more
 * reduces what has to be borrowed. The amortization itself reuses the shared
 * schedule builder, so the payment matches every other loan engine to the cent.
 */
export function calculateAutoLoan(input: AutoLoanInput): AutoLoanResult {
  const vehiclePrice = money(input.vehiclePrice)
  const downPayment = money(input.downPayment)
  const tradeInValue = money(input.tradeInValue)
  const tradeInOwed = money(input.tradeInOwed)
  const salesTaxRate = rate(input.salesTaxRate)
  const fees = money(input.fees)
  const financeTaxAndFees = input.financeTaxAndFees ?? true
  const annualRate = rate(input.annualRate)
  const termMonths = periods(input.termMonths)

  const taxableAmount = round2(Math.max(0, vehiclePrice - tradeInValue))
  const salesTax = round2(taxableAmount * (salesTaxRate / 100))

  const negativeEquity = round2(Math.max(0, tradeInOwed - tradeInValue))
  const tradeInEquity = round2(Math.max(0, tradeInValue - tradeInOwed))

  const financedExtras = financeTaxAndFees ? salesTax + fees : 0
  // A down payment plus equity larger than the price is a cash purchase, not a negative loan.
  const amountFinanced = round2(
    Math.max(0, vehiclePrice - downPayment - tradeInValue + tradeInOwed + financedExtras)
  )
  const upfrontCash = round2(downPayment + (financeTaxAndFees ? 0 : salesTax + fees))

  const amortization = buildAmortizationSchedule({
    principal: amountFinanced,
    annualRate,
    totalPeriods: termMonths,
  })

  const isValid = amountFinanced > 0 && termMonths > 0

  return {
    monthlyPayment: isValid ? amortization.monthlyPayment : 0,
    amountFinanced,
    totalInterest: amortization.totalInterest,
    totalOfPayments: amortization.totalPaid,
    totalCost: round2(upfrontCash + amortization.totalPaid),
    taxableAmount,
    salesTax,
    fees,
    upfrontCash,
    negativeEquity,
    tradeInEquity,
    schedule: amortization.rows,
    isValid,
  }
}
