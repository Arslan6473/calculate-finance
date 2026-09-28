import { describe, expect, it } from 'vitest'
import { applyBrackets, calculateFederalIncomeTax, calculateFica } from '@/lib/tax/federal'
import {
  FEDERAL_BRACKETS_2026,
  SOCIAL_SECURITY_WAGE_BASE_2026,
} from '@/lib/tax/us-federal-2026'

describe('applyBrackets', () => {
  it('taxes each dollar at its own bracket rate, not the marginal rate on everything', () => {
    // Single filer, $60,000 taxable income spans the 10/12/22% brackets.
    const { tax, marginalRate } = applyBrackets(60_000, FEDERAL_BRACKETS_2026.single)
    // 10% x 12,400 + 12% x 38,000 + 22% x 9,600
    const expected = 12_400 * 0.1 + 38_000 * 0.12 + 9_600 * 0.22
    expect(tax).toBeCloseTo(expected, 2)
    expect(marginalRate).toBe(0.22)
  })

  it('returns zero tax and zero marginal rate for zero income', () => {
    const { tax, marginalRate } = applyBrackets(0, FEDERAL_BRACKETS_2026.single)
    expect(tax).toBe(0)
    expect(marginalRate).toBe(0)
  })

  it('never applies a negative taxable income', () => {
    const { tax } = applyBrackets(-5000, FEDERAL_BRACKETS_2026.single)
    expect(tax).toBe(0)
  })

  it('applies the top marginal rate on income in the highest bracket', () => {
    const { marginalRate } = applyBrackets(1_000_000, FEDERAL_BRACKETS_2026.single)
    expect(marginalRate).toBe(0.37)
  })
})

describe('calculateFederalIncomeTax', () => {
  it('applies the standard deduction before taxing', () => {
    const result = calculateFederalIncomeTax({ grossAnnualIncome: 16_100, filingStatus: 'single' })
    expect(result.taxableIncome).toBe(0)
    expect(result.federalTax).toBe(0)
  })

  it('reduces taxable income by pre-tax deductions', () => {
    const withoutDeduction = calculateFederalIncomeTax({
      grossAnnualIncome: 80_000,
      filingStatus: 'single',
    })
    const withDeduction = calculateFederalIncomeTax({
      grossAnnualIncome: 80_000,
      filingStatus: 'single',
      preTaxDeductions: 10_000,
    })
    expect(withDeduction.taxableIncome).toBeLessThan(withoutDeduction.taxableIncome)
    expect(withDeduction.federalTax).toBeLessThan(withoutDeduction.federalTax)
  })

  it('uses the larger of itemized and standard deduction', () => {
    const result = calculateFederalIncomeTax({
      grossAnnualIncome: 100_000,
      filingStatus: 'single',
      itemizedDeductions: 30_000,
    })
    expect(result.deductionApplied).toBe(30_000)
  })

  it('produces a different result for married filing jointly than single', () => {
    const single = calculateFederalIncomeTax({ grossAnnualIncome: 100_000, filingStatus: 'single' })
    const married = calculateFederalIncomeTax({ grossAnnualIncome: 100_000, filingStatus: 'married' })
    expect(married.federalTax).toBeLessThan(single.federalTax)
  })

  it('handles a zero income', () => {
    const result = calculateFederalIncomeTax({ grossAnnualIncome: 0, filingStatus: 'single' })
    expect(result.federalTax).toBe(0)
    expect(result.effectiveRate).toBe(0)
  })
})

describe('calculateFica', () => {
  it('calculates 6.2% Social Security and 1.45% Medicare below the wage base', () => {
    const result = calculateFica(80_000, 'single')
    expect(result.socialSecurity).toBeCloseTo(80_000 * 0.062, 2)
    expect(result.medicare).toBeCloseTo(80_000 * 0.0145, 2)
    expect(result.additionalMedicare).toBe(0)
    expect(result.hitWageBase).toBe(false)
  })

  it('caps Social Security at the wage base', () => {
    const result = calculateFica(300_000, 'single')
    expect(result.socialSecurity).toBeCloseTo(SOCIAL_SECURITY_WAGE_BASE_2026 * 0.062, 2)
    expect(result.hitWageBase).toBe(true)
  })

  it('applies the additional Medicare surtax above the filing-status threshold', () => {
    const result = calculateFica(250_000, 'single')
    expect(result.additionalMedicare).toBeCloseTo((250_000 - 200_000) * 0.009, 2)
  })

  it('uses a higher additional-Medicare threshold for married filing jointly', () => {
    const income = 220_000
    const single = calculateFica(income, 'single')
    const married = calculateFica(income, 'married')
    expect(single.additionalMedicare).toBeGreaterThan(0)
    expect(married.additionalMedicare).toBe(0)
  })

  it('handles a zero income', () => {
    const result = calculateFica(0, 'single')
    expect(result.total).toBe(0)
  })
})
