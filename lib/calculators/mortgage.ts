import {
  buildAmortizationSchedule,
  type AmortizationRow,
  type AmortizationSchedule,
} from './amortization'
import { money, rate, round2, years } from './guards'

export interface MortgageInput {
  homePrice: number
  downPayment: number
  /** Term in years. */
  termYears: number
  /** Annual percentage rate, e.g. 6.5. */
  annualRate: number
  /** Annual property tax in currency units. */
  annualPropertyTax?: number
  /** Annual homeowners insurance in currency units. */
  annualHomeInsurance?: number
  /** Monthly HOA or condo fee. */
  monthlyHoa?: number
  /** Annual PMI rate as a percentage of the loan, e.g. 0.5. */
  pmiRate?: number
  /** Voluntary extra principal each month. */
  extraMonthlyPayment?: number
}

export interface MortgageResult {
  loanAmount: number
  downPaymentPercent: number

  /** Principal and interest only. */
  principalAndInterest: number
  monthlyPropertyTax: number
  monthlyHomeInsurance: number
  monthlyHoa: number
  /** Zero once the loan-to-value ratio reaches 80%. */
  monthlyPmi: number
  /** Everything above, summed — the number most users come for. */
  totalMonthlyPayment: number

  totalInterest: number
  /** Principal + interest over the life of the loan. */
  totalOfPayments: number
  /** Principal + interest + tax + insurance + HOA + PMI over the life of the loan. */
  totalCostOfOwnership: number

  /** Months required to repay — below the term when overpaying. */
  monthsToPayoff: number
  /** Months of PMI before reaching 80% LTV. Zero when no PMI applies. */
  pmiMonths: number

  schedule: AmortizationRow[]
  /** True when the inputs describe a real loan; false when the form is empty. */
  isValid: boolean
}

/** PMI is conventionally dropped once the borrower holds 20% equity. */
const PMI_LTV_THRESHOLD = 0.8

/**
 * Calculates a full monthly mortgage payment and amortisation schedule.
 *
 * Escrow items (tax, insurance, HOA) are additive and do not accrue interest, so
 * they are computed independently of the amortisation. PMI is different: it is a
 * function of the *outstanding* balance, so it stops partway through the term.
 * We walk the schedule to find the month equity crosses 20% rather than
 * approximating, because that month is what determines the true total cost.
 */
export function calculateMortgage(input: MortgageInput): MortgageResult {
  const homePrice = money(input.homePrice)
  const downPaymentRaw = money(input.downPayment)
  // A down payment above the price is a typo, not a negative loan.
  const downPayment = Math.min(downPaymentRaw, homePrice)
  const loanAmount = round2(homePrice - downPayment)

  const termYears = years(input.termYears)
  const annualRate = rate(input.annualRate)
  const totalPeriods = termYears * 12

  const annualPropertyTax = money(input.annualPropertyTax)
  const annualHomeInsurance = money(input.annualHomeInsurance)
  const monthlyHoa = money(input.monthlyHoa)
  const pmiRate = rate(input.pmiRate)
  const extraMonthlyPayment = money(input.extraMonthlyPayment)

  const monthlyPropertyTax = round2(annualPropertyTax / 12)
  const monthlyHomeInsurance = round2(annualHomeInsurance / 12)

  const amortization: AmortizationSchedule = buildAmortizationSchedule({
    principal: loanAmount,
    annualRate,
    totalPeriods,
    extraMonthlyPayment,
  })

  const principalAndInterest = amortization.monthlyPayment

  // PMI applies only while the balance exceeds 80% of the original home price.
  const pmiThresholdBalance = homePrice * PMI_LTV_THRESHOLD
  const startsWithPmi = pmiRate > 0 && homePrice > 0 && loanAmount > pmiThresholdBalance
  const monthlyPmi = startsWithPmi ? round2((loanAmount * pmiRate) / 100 / 12) : 0

  let pmiMonths = 0
  if (startsWithPmi) {
    const crossing = amortization.rows.findIndex((row) => row.balance <= pmiThresholdBalance)
    // If the balance never crosses the threshold within the term, PMI runs the
    // whole way — which is what happens on a term too short to build equity.
    pmiMonths = crossing === -1 ? amortization.actualPeriods : crossing + 1
  }

  const totalMonthlyPayment = round2(
    principalAndInterest + monthlyPropertyTax + monthlyHomeInsurance + monthlyHoa + monthlyPmi
  )

  const monthsToPayoff = amortization.actualPeriods
  const escrowMonths = monthsToPayoff

  const totalCostOfOwnership = round2(
    amortization.totalPaid +
      (monthlyPropertyTax + monthlyHomeInsurance + monthlyHoa) * escrowMonths +
      monthlyPmi * pmiMonths
  )

  return {
    loanAmount,
    downPaymentPercent: homePrice > 0 ? round2((downPayment / homePrice) * 100) : 0,
    principalAndInterest,
    monthlyPropertyTax,
    monthlyHomeInsurance,
    monthlyHoa,
    monthlyPmi,
    totalMonthlyPayment,
    totalInterest: amortization.totalInterest,
    totalOfPayments: amortization.totalPaid,
    totalCostOfOwnership,
    monthsToPayoff,
    pmiMonths,
    schedule: amortization.rows,
    isValid: loanAmount > 0 && totalPeriods > 0,
  }
}
