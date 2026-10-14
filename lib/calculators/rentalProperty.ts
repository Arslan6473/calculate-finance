import { annuityPayment, money, rate, round2, years } from './guards'

export interface RentalPropertyInput {
  purchasePrice: number
  /** Down payment as a percentage of the purchase price, e.g. 25. */
  downPaymentPercent: number
  /** One-off closing costs paid in cash at purchase. */
  closingCosts?: number
  /** Annual percentage rate, e.g. 7. */
  annualRate: number
  termYears: number

  /** Scheduled rent when fully occupied. */
  monthlyRent: number
  /** Share of scheduled rent lost to empty months and non-payment. */
  vacancyPercent?: number

  annualPropertyTax?: number
  annualInsurance?: number
  /** Maintenance and repair reserve, as a percentage of scheduled rent. */
  maintenancePercent?: number
  /** Property management fee, as a percentage of rent actually collected. */
  managementPercent?: number
  monthlyHoa?: number
  monthlyOther?: number
}

export interface RentalPropertyResult {
  downPayment: number
  loanAmount: number
  /** Down payment plus closing costs — the denominator of cash-on-cash return. */
  totalCashInvested: number
  /** Monthly principal and interest. */
  monthlyMortgagePayment: number

  /** Scheduled rent less vacancy. */
  effectiveMonthlyRent: number
  monthlyVacancyLoss: number
  monthlyPropertyTax: number
  monthlyInsurance: number
  monthlyMaintenance: number
  monthlyManagement: number
  monthlyHoa: number
  monthlyOther: number
  /** Every operating cost above — excludes the mortgage by definition. */
  monthlyOperatingExpenses: number

  /** Net operating income: effective rent less operating expenses, per year. */
  annualNoi: number
  monthlyCashFlow: number
  annualCashFlow: number

  /** NOI ÷ purchase price, as a percentage. Ignores financing. */
  capRate: number
  /** Annual cash flow ÷ total cash invested, as a percentage. */
  cashOnCashReturn: number
  /** Purchase price ÷ annual scheduled rent. */
  grossRentMultiplier: number
  /** NOI ÷ annual debt service. Null when there is no loan. */
  debtServiceCoverage: number | null
  /** Monthly rent ÷ purchase price, as a percentage. */
  rentToPricePercent: number
  /** True when monthly rent is at least 1% of the purchase price. */
  passesOnePercentRule: boolean

  isValid: boolean
}

/**
 * Analyses a buy-to-let property using the standard investor metrics.
 *
 * The definitions matter, because the same words get used loosely:
 *
 * - **NOI** is income after operating costs but *before* the mortgage. It
 *   describes the property, not the buyer's financing.
 * - **Cap rate** is NOI ÷ price, so two buyers with different loans see the
 *   same cap rate on the same building.
 * - **Cash flow** is NOI less the mortgage payment — what actually lands in
 *   the owner's account.
 * - **Cash-on-cash** is annual cash flow ÷ the cash the buyer put in (down
 *   payment plus closing costs). Principal paydown and appreciation are
 *   deliberately excluded; they are real returns but not cash.
 *
 * Maintenance is reserved against scheduled rent because repairs happen whether
 * or not the unit is let; management is charged on rent collected, which is how
 * most managers bill.
 */
export function calculateRentalProperty(input: RentalPropertyInput): RentalPropertyResult {
  const purchasePrice = money(input.purchasePrice)
  const downPaymentPercent = Math.min(rate(input.downPaymentPercent), 100)
  const closingCosts = money(input.closingCosts)
  const annualRate = rate(input.annualRate)
  const termYears = years(input.termYears)

  const monthlyRent = money(input.monthlyRent)
  const vacancyPercent = Math.min(rate(input.vacancyPercent), 100)
  const annualPropertyTax = money(input.annualPropertyTax)
  const annualInsurance = money(input.annualInsurance)
  const maintenancePercent = Math.min(rate(input.maintenancePercent), 100)
  const managementPercent = Math.min(rate(input.managementPercent), 100)
  const monthlyHoa = money(input.monthlyHoa)
  const monthlyOther = money(input.monthlyOther)

  const downPayment = purchasePrice * (downPaymentPercent / 100)
  const loanAmount = purchasePrice - downPayment
  const totalCashInvested = downPayment + closingCosts
  const monthlyMortgagePayment = round2(
    annuityPayment(loanAmount, annualRate / 100 / 12, termYears * 12)
  )

  const monthlyVacancyLoss = monthlyRent * (vacancyPercent / 100)
  const effectiveMonthlyRent = monthlyRent - monthlyVacancyLoss
  const monthlyPropertyTax = annualPropertyTax / 12
  const monthlyInsurance = annualInsurance / 12
  const monthlyMaintenance = monthlyRent * (maintenancePercent / 100)
  const monthlyManagement = effectiveMonthlyRent * (managementPercent / 100)

  const monthlyOperatingExpenses =
    monthlyPropertyTax +
    monthlyInsurance +
    monthlyMaintenance +
    monthlyManagement +
    monthlyHoa +
    monthlyOther

  const monthlyNoi = effectiveMonthlyRent - monthlyOperatingExpenses
  const annualNoi = monthlyNoi * 12
  const monthlyCashFlow = monthlyNoi - monthlyMortgagePayment
  const annualCashFlow = monthlyCashFlow * 12
  const annualDebtService = monthlyMortgagePayment * 12
  const annualScheduledRent = monthlyRent * 12

  return {
    downPayment: round2(downPayment),
    loanAmount: round2(loanAmount),
    totalCashInvested: round2(totalCashInvested),
    monthlyMortgagePayment,
    effectiveMonthlyRent: round2(effectiveMonthlyRent),
    monthlyVacancyLoss: round2(monthlyVacancyLoss),
    monthlyPropertyTax: round2(monthlyPropertyTax),
    monthlyInsurance: round2(monthlyInsurance),
    monthlyMaintenance: round2(monthlyMaintenance),
    monthlyManagement: round2(monthlyManagement),
    monthlyHoa: round2(monthlyHoa),
    monthlyOther: round2(monthlyOther),
    monthlyOperatingExpenses: round2(monthlyOperatingExpenses),
    annualNoi: round2(annualNoi),
    monthlyCashFlow: round2(monthlyCashFlow),
    annualCashFlow: round2(annualCashFlow),
    capRate: purchasePrice > 0 ? round2((annualNoi / purchasePrice) * 100) : 0,
    cashOnCashReturn:
      totalCashInvested > 0 ? round2((annualCashFlow / totalCashInvested) * 100) : 0,
    grossRentMultiplier:
      annualScheduledRent > 0 ? round2(purchasePrice / annualScheduledRent) : 0,
    debtServiceCoverage: annualDebtService > 0 ? round2(annualNoi / annualDebtService) : null,
    rentToPricePercent: purchasePrice > 0 ? round2((monthlyRent / purchasePrice) * 100) : 0,
    passesOnePercentRule: purchasePrice > 0 && monthlyRent >= purchasePrice * 0.01,
    isValid: purchasePrice > 0 && monthlyRent > 0,
  }
}
