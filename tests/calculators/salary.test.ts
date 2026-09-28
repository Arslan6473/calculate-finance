import { describe, expect, it } from 'vitest'
import { annualToHourly, calculateSalary, hourlyToAnnual } from '@/lib/calculators/salary'

describe('calculateSalary', () => {
  it('converts an annual salary to take-home pay', () => {
    const result = calculateSalary({
      amount: 85_000,
      payBasis: 'annually',
      payFrequency: 'biweekly',
      filingStatus: 'single',
    })
    expect(result.isValid).toBe(true)
    expect(result.grossAnnual).toBe(85_000)
    expect(result.netAnnual).toBeLessThan(result.grossAnnual)
    expect(result.netAnnual).toBeGreaterThan(0)
  })

  it('converts an hourly wage to an annual gross', () => {
    const result = calculateSalary({
      amount: 25,
      payBasis: 'hourly',
      payFrequency: 'weekly',
      filingStatus: 'single',
      hoursPerWeek: 40,
    })
    expect(result.grossAnnual).toBeCloseTo(25 * 40 * 52, 0)
  })

  it('reduces unpaid weeks off from the hourly annual calculation', () => {
    const fullYear = calculateSalary({
      amount: 25,
      payBasis: 'hourly',
      payFrequency: 'weekly',
      filingStatus: 'single',
      hoursPerWeek: 40,
    })
    const withUnpaidWeeks = calculateSalary({
      amount: 25,
      payBasis: 'hourly',
      payFrequency: 'weekly',
      filingStatus: 'single',
      hoursPerWeek: 40,
      unpaidWeeksOff: 2,
    })
    expect(withUnpaidWeeks.grossAnnual).toBeLessThan(fullYear.grossAnnual)
  })

  it('reduces taxable income by pre-tax deductions like a 401(k)', () => {
    const withoutContribution = calculateSalary({
      amount: 85_000,
      payBasis: 'annually',
      payFrequency: 'biweekly',
      filingStatus: 'single',
    })
    const withContribution = calculateSalary({
      amount: 85_000,
      payBasis: 'annually',
      payFrequency: 'biweekly',
      filingStatus: 'single',
      preTaxDeductions: 8000,
    })
    expect(withContribution.federalTax).toBeLessThan(withoutContribution.federalTax)
    // FICA is unaffected by 401(k) contributions.
    expect(withContribution.socialSecurity).toBeCloseTo(withoutContribution.socialSecurity, 2)
  })

  it('applies the user-supplied state tax rate', () => {
    const noState = calculateSalary({
      amount: 85_000,
      payBasis: 'annually',
      payFrequency: 'biweekly',
      filingStatus: 'single',
    })
    const withState = calculateSalary({
      amount: 85_000,
      payBasis: 'annually',
      payFrequency: 'biweekly',
      filingStatus: 'single',
      stateTaxRate: 5,
    })
    expect(withState.stateTax).toBeGreaterThan(0)
    expect(withState.netAnnual).toBeLessThan(noState.netAnnual)
  })

  it('returns an invalid result for a zero salary', () => {
    const result = calculateSalary({
      amount: 0,
      payBasis: 'annually',
      payFrequency: 'monthly',
      filingStatus: 'single',
    })
    expect(result.isValid).toBe(false)
    expect(result.netAnnual).toBe(0)
  })

  it('handles a very high income without NaN or Infinity', () => {
    const result = calculateSalary({
      amount: 5_000_000,
      payBasis: 'annually',
      payFrequency: 'monthly',
      filingStatus: 'single',
    })
    expect(Number.isFinite(result.netAnnual)).toBe(true)
    expect(result.hitSocialSecurityWageBase).toBe(true)
  })

  it('never lets net pay go negative even with large deductions', () => {
    const result = calculateSalary({
      amount: 40_000,
      payBasis: 'annually',
      payFrequency: 'monthly',
      filingStatus: 'single',
      preTaxDeductions: 30_000,
      postTaxDeductions: 30_000,
    })
    expect(result.netAnnual).toBeGreaterThanOrEqual(0)
  })
})

describe('hourlyToAnnual / annualToHourly', () => {
  it('round-trips a standard full-time schedule', () => {
    const annual = hourlyToAnnual(30, 40, 52)
    expect(annual).toBe(30 * 40 * 52)
    expect(annualToHourly(annual, 40, 52)).toBeCloseTo(30, 2)
  })

  it('returns zero hourly rate for zero annual salary', () => {
    expect(annualToHourly(0)).toBe(0)
  })
})
