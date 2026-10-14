import { calculateMortgage } from './mortgage'
import { annuityPayment, money, rate, round2, years } from './guards'

export interface HomeAffordabilityInput {
  /** Gross (pre-tax) annual household income. */
  annualIncome: number
  /** Minimum monthly payments on existing debts: car, student loans, cards. */
  monthlyDebts?: number
  downPayment: number
  /** Annual percentage rate, e.g. 6.5. */
  annualRate: number
  termYears: number
  /** Annual property tax as a percentage of home value, e.g. 1.1. */
  propertyTaxRate?: number
  annualHomeInsurance?: number
  monthlyHoa?: number
  /** Housing cost ceiling as a percentage of gross monthly income. Default 28. */
  frontEndDti?: number
  /** Housing plus all debts ceiling as a percentage of gross monthly income. Default 36. */
  backEndDti?: number
}

export type BindingRule = 'front-end' | 'back-end'

export interface HomeAffordabilityResult {
  /** Highest price whose full monthly payment fits the binding DTI rule. */
  maxHomePrice: number
  loanAmount: number
  downPaymentPercent: number

  /** Housing budget allowed by the binding rule — PITI plus HOA. */
  maxMonthlyHousingPayment: number
  /** Housing budget under the front-end rule alone. */
  frontEndLimit: number
  /** Housing budget under the back-end rule alone, after existing debts. */
  backEndLimit: number
  bindingRule: BindingRule

  // Breakdown of the payment at the maximum price.
  principalAndInterest: number
  monthlyPropertyTax: number
  monthlyHomeInsurance: number
  monthlyHoa: number
  totalMonthlyPayment: number

  /** Housing payment ÷ gross monthly income at the maximum price, as a percentage. */
  frontEndRatio: number
  /** (Housing payment + debts) ÷ gross monthly income at the maximum price, as a percentage. */
  backEndRatio: number

  isValid: boolean
}

/**
 * Finds the most expensive home whose full monthly cost fits under both
 * debt-to-income rules a conventional lender applies.
 *
 * The front-end rule caps housing cost at a share of gross income (28% by
 * convention); the back-end rule caps housing *plus* existing debt payments (36%
 * by convention). Whichever leaves the smaller housing budget is the one that
 * binds.
 *
 * The monthly cost of a home is linear in its price, which lets us solve for the
 * price exactly instead of searching:
 *
 *     budget = f·(P − D) + t·P + fixed
 *
 * where f is the payment per dollar borrowed (the annuity factor), t is the
 * monthly property-tax rate, D is the down payment and `fixed` is insurance plus
 * HOA. Rearranged, P = D + (budget − fixed − t·D) / (f + t). If the down payment
 * alone already covers a home the budget can carry, no loan is needed and the
 * price is limited by property tax alone.
 */
export function calculateHomeAffordability(
  input: HomeAffordabilityInput
): HomeAffordabilityResult {
  const annualIncome = money(input.annualIncome)
  const monthlyDebts = money(input.monthlyDebts)
  const downPayment = money(input.downPayment)
  const annualRate = rate(input.annualRate)
  const termYears = years(input.termYears)
  const propertyTaxRate = rate(input.propertyTaxRate)
  const annualHomeInsurance = money(input.annualHomeInsurance)
  const monthlyHoa = money(input.monthlyHoa)
  // A DTI limit above 100% of income is meaningless, so cap there.
  const frontEndDti = Math.min(rate(input.frontEndDti ?? 28), 100)
  const backEndDti = Math.min(rate(input.backEndDti ?? 36), 100)

  const grossMonthlyIncome = annualIncome / 12
  const frontEndLimit = Math.max(0, grossMonthlyIncome * (frontEndDti / 100))
  const backEndLimit = Math.max(0, grossMonthlyIncome * (backEndDti / 100) - monthlyDebts)
  // Ties go to the front-end rule: it is the one most borrowers hit first.
  const bindingRule: BindingRule = frontEndLimit <= backEndLimit ? 'front-end' : 'back-end'
  const maxMonthlyHousingPayment = Math.min(frontEndLimit, backEndLimit)

  const totalPeriods = termYears * 12
  const paymentPerDollar = annuityPayment(1, annualRate / 100 / 12, totalPeriods)
  const monthlyTaxRate = propertyTaxRate / 100 / 12
  const fixedMonthly = annualHomeInsurance / 12 + monthlyHoa
  const available = maxMonthlyHousingPayment - fixedMonthly

  let maxHomePrice = 0
  if (available > 0 && totalPeriods > 0) {
    if (available >= monthlyTaxRate * downPayment) {
      maxHomePrice = downPayment + (available - monthlyTaxRate * downPayment) / (paymentPerDollar + monthlyTaxRate)
    } else {
      // The down payment exceeds what the budget can carry in tax alone: the
      // buyer pays cash and the property tax is the only scaling cost.
      maxHomePrice = available / monthlyTaxRate
    }
  }
  // Round *down* to whole currency units so the payment never exceeds the limit.
  maxHomePrice = Math.floor(Math.min(maxHomePrice, 1e12))

  const mortgage = calculateMortgage({
    homePrice: maxHomePrice,
    downPayment,
    termYears,
    annualRate,
    annualPropertyTax: maxHomePrice * (propertyTaxRate / 100),
    annualHomeInsurance,
    monthlyHoa,
  })

  const isValid = grossMonthlyIncome > 0 && totalPeriods > 0 && maxHomePrice > 0
  const totalMonthlyPayment = isValid ? mortgage.totalMonthlyPayment : 0

  return {
    maxHomePrice: isValid ? maxHomePrice : 0,
    loanAmount: isValid ? mortgage.loanAmount : 0,
    downPaymentPercent: isValid ? mortgage.downPaymentPercent : 0,
    maxMonthlyHousingPayment: round2(maxMonthlyHousingPayment),
    frontEndLimit: round2(frontEndLimit),
    backEndLimit: round2(backEndLimit),
    bindingRule,
    principalAndInterest: isValid ? mortgage.principalAndInterest : 0,
    monthlyPropertyTax: isValid ? mortgage.monthlyPropertyTax : 0,
    monthlyHomeInsurance: isValid ? mortgage.monthlyHomeInsurance : 0,
    monthlyHoa: isValid ? mortgage.monthlyHoa : 0,
    totalMonthlyPayment,
    frontEndRatio:
      grossMonthlyIncome > 0 ? round2((totalMonthlyPayment / grossMonthlyIncome) * 100) : 0,
    backEndRatio:
      grossMonthlyIncome > 0
        ? round2(((totalMonthlyPayment + monthlyDebts) / grossMonthlyIncome) * 100)
        : 0,
    isValid,
  }
}
