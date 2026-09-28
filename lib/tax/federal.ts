import { money, round2 } from '../calculators/guards'
import {
  ADDITIONAL_MEDICARE_RATE,
  ADDITIONAL_MEDICARE_THRESHOLD,
  FEDERAL_BRACKETS_2026,
  MEDICARE_RATE,
  SOCIAL_SECURITY_RATE,
  SOCIAL_SECURITY_WAGE_BASE_2026,
  STANDARD_DEDUCTION_2026,
  type FilingStatus,
  type TaxBracket,
} from './us-federal-2026'

export interface BracketDetail {
  rate: number
  /** Income taxed at this rate. */
  taxableInBracket: number
  /** Tax owed from this bracket alone. */
  tax: number
}

export interface FederalTaxResult {
  /** Income after pre-tax deductions and the standard/itemised deduction. */
  taxableIncome: number
  deductionApplied: number
  federalTax: number
  /** Rate on the next dollar earned. */
  marginalRate: number
  /** Federal tax as a share of gross income. */
  effectiveRate: number
  /** Per-bracket breakdown, for showing how the total was reached. */
  brackets: BracketDetail[]
}

/**
 * Applies a progressive bracket table.
 *
 * The point worth being careful about: only the income *within* each band is
 * taxed at that band's rate. This is the single most common misunderstanding
 * about income tax, which is why the per-bracket breakdown is returned and shown
 * rather than just the total.
 */
export function applyBrackets(
  taxableIncome: number,
  brackets: TaxBracket[]
): { tax: number; marginalRate: number; details: BracketDetail[] } {
  const income = Math.max(0, taxableIncome)
  let tax = 0
  let marginalRate = 0
  const details: BracketDetail[] = []

  for (const bracket of brackets) {
    if (income <= bracket.from) break

    const upper = Math.min(income, bracket.to)
    const taxableInBracket = upper - bracket.from
    if (taxableInBracket <= 0) continue

    const bracketTax = taxableInBracket * bracket.rate
    tax += bracketTax
    marginalRate = bracket.rate

    details.push({
      rate: bracket.rate,
      taxableInBracket: round2(taxableInBracket),
      tax: round2(bracketTax),
    })
  }

  return { tax: round2(tax), marginalRate, details }
}

export interface FederalTaxInput {
  grossAnnualIncome: number
  filingStatus: FilingStatus
  /** 401(k), HSA and similar contributions that reduce taxable income. */
  preTaxDeductions?: number
  /**
   * Itemised deductions. The larger of this and the standard deduction is used,
   * which is what a filer would actually do.
   */
  itemizedDeductions?: number
}

export function calculateFederalIncomeTax(input: FederalTaxInput): FederalTaxResult {
  const gross = money(input.grossAnnualIncome)
  const preTax = Math.min(money(input.preTaxDeductions), gross)
  const status = input.filingStatus in FEDERAL_BRACKETS_2026 ? input.filingStatus : 'single'

  const standardDeduction = STANDARD_DEDUCTION_2026[status]
  const itemized = money(input.itemizedDeductions)
  const deductionApplied = Math.max(standardDeduction, itemized)

  const afterPreTax = Math.max(0, gross - preTax)
  const taxableIncome = Math.max(0, afterPreTax - deductionApplied)

  const { tax, marginalRate, details } = applyBrackets(taxableIncome, FEDERAL_BRACKETS_2026[status])

  return {
    taxableIncome: round2(taxableIncome),
    deductionApplied,
    federalTax: tax,
    marginalRate,
    effectiveRate: gross > 0 ? round2((tax / gross) * 100) : 0,
    brackets: details,
  }
}

export interface FicaResult {
  socialSecurity: number
  medicare: number
  additionalMedicare: number
  total: number
  /** True when earnings exceeded the Social Security wage base. */
  hitWageBase: boolean
}

/**
 * Social Security and Medicare (employee share).
 *
 * Note that FICA is levied on gross wages *before* the standard deduction, and
 * that 401(k) contributions do not reduce it — a detail that surprises people and
 * is worth modelling correctly rather than approximating. HSA contributions made
 * through a cafeteria plan do escape FICA, but that distinction is finer than
 * this calculator's inputs support, so pre-tax deductions are treated as
 * FICA-exempt only for income tax.
 */
export function calculateFica(grossAnnualIncome: number, filingStatus: FilingStatus): FicaResult {
  const gross = money(grossAnnualIncome)
  const status = filingStatus in ADDITIONAL_MEDICARE_THRESHOLD ? filingStatus : 'single'

  const ssWages = Math.min(gross, SOCIAL_SECURITY_WAGE_BASE_2026)
  const socialSecurity = round2(ssWages * SOCIAL_SECURITY_RATE)

  const medicare = round2(gross * MEDICARE_RATE)

  const surtaxThreshold = ADDITIONAL_MEDICARE_THRESHOLD[status]
  const surtaxWages = Math.max(0, gross - surtaxThreshold)
  const additionalMedicare = round2(surtaxWages * ADDITIONAL_MEDICARE_RATE)

  return {
    socialSecurity,
    medicare,
    additionalMedicare,
    total: round2(socialSecurity + medicare + additionalMedicare),
    hitWageBase: gross > SOCIAL_SECURITY_WAGE_BASE_2026,
  }
}
