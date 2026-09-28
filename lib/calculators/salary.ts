import { money, num, rate, round2 } from './guards'
import { calculateFederalIncomeTax, calculateFica, type BracketDetail } from '../tax/federal'
import { PAY_FREQUENCIES, type FilingStatus, type PayFrequency } from '../tax/us-federal-2026'

/** Standard full-time assumptions, overridable by the caller. */
const DEFAULT_HOURS_PER_WEEK = 40
const WEEKS_PER_YEAR = 52

export interface SalaryInput {
  /** Gross pay for the chosen period. */
  amount: number
  /** The period `amount` refers to. `hourly` triggers the hours-based path. */
  payBasis: 'hourly' | PayFrequency
  /** How often the paycheck arrives, for the per-paycheck figures. */
  payFrequency: PayFrequency
  filingStatus: FilingStatus
  /** State + local income tax as a flat percentage, supplied by the user. */
  stateTaxRate?: number
  /** Annual 401(k) / HSA contributions. */
  preTaxDeductions?: number
  /** Annual post-tax deductions, e.g. Roth 401(k) or garnishments. */
  postTaxDeductions?: number
  hoursPerWeek?: number
  /** Unpaid weeks off. Reduces annual gross on the hourly path. */
  unpaidWeeksOff?: number
}

export interface SalaryResult {
  grossAnnual: number
  grossMonthly: number
  grossBiweekly: number
  grossWeekly: number
  grossPerPaycheck: number
  hourlyEquivalent: number

  federalTax: number
  socialSecurity: number
  medicare: number
  additionalMedicare: number
  stateTax: number
  preTaxDeductions: number
  postTaxDeductions: number
  totalTax: number

  netAnnual: number
  netMonthly: number
  netPerPaycheck: number

  /** Total tax as a share of gross. */
  effectiveTaxRate: number
  /** Federal rate on the next dollar earned. */
  marginalTaxRate: number
  /** Share of gross kept after all tax and deductions. */
  takeHomePercent: number

  taxableIncome: number
  federalBrackets: BracketDetail[]
  hitSocialSecurityWageBase: boolean
  isValid: boolean
}

/**
 * Converts pay expressed on any basis into an annual figure.
 * The hourly path accounts for unpaid time off, which a naive
 * `hourly × 40 × 52` overstates.
 */
function toAnnualGross(input: SalaryInput): { annual: number; hoursPerYear: number } {
  const amount = money(input.amount)
  const hoursPerWeek = Math.min(Math.max(num(input.hoursPerWeek) || DEFAULT_HOURS_PER_WEEK, 0), 168)
  const unpaidWeeks = Math.min(Math.max(num(input.unpaidWeeksOff), 0), WEEKS_PER_YEAR)
  const paidWeeks = WEEKS_PER_YEAR - unpaidWeeks

  if (input.payBasis === 'hourly') {
    const hoursPerYear = hoursPerWeek * paidWeeks
    return { annual: amount * hoursPerYear, hoursPerYear }
  }

  const periodsPerYear = PAY_FREQUENCIES[input.payBasis] ?? 1
  return { annual: amount * periodsPerYear, hoursPerYear: hoursPerWeek * WEEKS_PER_YEAR }
}

/**
 * Take-home pay from gross, using real 2026 US federal brackets and FICA.
 *
 * State and local tax is a user-supplied flat rate (design decision D1). The UI
 * labels the federal scope explicitly so the result is never mistaken for a full
 * multi-jurisdiction payroll calculation.
 */
export function calculateSalary(input: SalaryInput): SalaryResult {
  const { annual: grossAnnual, hoursPerYear } = toAnnualGross(input)
  const preTaxDeductions = Math.min(money(input.preTaxDeductions), grossAnnual)
  const postTaxDeductions = money(input.postTaxDeductions)
  const stateTaxRate = Math.min(rate(input.stateTaxRate), 100)

  const periodsPerYear = PAY_FREQUENCIES[input.payFrequency] ?? 12

  const federal = calculateFederalIncomeTax({
    grossAnnualIncome: grossAnnual,
    filingStatus: input.filingStatus,
    preTaxDeductions,
  })

  const fica = calculateFica(grossAnnual, input.filingStatus)

  // State tax is applied to income after pre-tax deductions, which is how most
  // states that piggyback on federal AGI actually work.
  const stateTaxableIncome = Math.max(0, grossAnnual - preTaxDeductions)
  const stateTax = round2(stateTaxableIncome * (stateTaxRate / 100))

  const totalTax = round2(federal.federalTax + fica.total + stateTax)
  const netAnnual = round2(
    Math.max(0, grossAnnual - totalTax - preTaxDeductions - postTaxDeductions)
  )

  return {
    grossAnnual: round2(grossAnnual),
    grossMonthly: round2(grossAnnual / 12),
    grossBiweekly: round2(grossAnnual / 26),
    grossWeekly: round2(grossAnnual / 52),
    grossPerPaycheck: round2(grossAnnual / periodsPerYear),
    hourlyEquivalent: hoursPerYear > 0 ? round2(grossAnnual / hoursPerYear) : 0,

    federalTax: federal.federalTax,
    socialSecurity: fica.socialSecurity,
    medicare: fica.medicare,
    additionalMedicare: fica.additionalMedicare,
    stateTax,
    preTaxDeductions: round2(preTaxDeductions),
    postTaxDeductions: round2(postTaxDeductions),
    totalTax,

    netAnnual,
    netMonthly: round2(netAnnual / 12),
    netPerPaycheck: round2(netAnnual / periodsPerYear),

    effectiveTaxRate: grossAnnual > 0 ? round2((totalTax / grossAnnual) * 100) : 0,
    marginalTaxRate: round2(federal.marginalRate * 100),
    takeHomePercent: grossAnnual > 0 ? round2((netAnnual / grossAnnual) * 100) : 0,

    taxableIncome: federal.taxableIncome,
    federalBrackets: federal.brackets,
    hitSocialSecurityWageBase: fica.hitWageBase,
    isValid: grossAnnual > 0,
  }
}

/** Converts an hourly wage to an annual salary. Used by the salary↔hourly pages. */
export function hourlyToAnnual(
  hourlyRate: number,
  hoursPerWeek = DEFAULT_HOURS_PER_WEEK,
  paidWeeks = WEEKS_PER_YEAR
): number {
  return round2(money(hourlyRate) * Math.max(0, num(hoursPerWeek)) * Math.max(0, num(paidWeeks)))
}

/** Converts an annual salary to an hourly wage. */
export function annualToHourly(
  annualSalary: number,
  hoursPerWeek = DEFAULT_HOURS_PER_WEEK,
  paidWeeks = WEEKS_PER_YEAR
): number {
  const hours = Math.max(0, num(hoursPerWeek)) * Math.max(0, num(paidWeeks))
  return hours > 0 ? round2(money(annualSalary) / hours) : 0
}
