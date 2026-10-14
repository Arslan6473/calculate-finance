import { describe, expect, it } from 'vitest'
import { calculateHomeAffordability } from '@/lib/calculators/homeAffordability'

const baseInput = {
  annualIncome: 100_000,
  monthlyDebts: 500,
  downPayment: 60_000,
  annualRate: 6.5,
  termYears: 30,
  propertyTaxRate: 1.1,
  annualHomeInsurance: 1_500,
  monthlyHoa: 0,
  frontEndDti: 28,
  backEndDti: 36,
}

describe('calculateHomeAffordability', () => {
  it('solves for the maximum price under the front-end rule', () => {
    const result = calculateHomeAffordability(baseInput)
    // Income 8,333.33/mo. Front-end: 28% = 2,333.33. Back-end: 36% − 500 = 2,500.
    expect(result.frontEndLimit).toBeCloseTo(2333.33, 2)
    expect(result.backEndLimit).toBe(2500)
    expect(result.bindingRule).toBe('front-end')
    expect(result.maxMonthlyHousingPayment).toBeCloseTo(2333.33, 2)
    // P = 60,000 + (2,208.33 − 0.000916667·60,000) / (0.00632068 + 0.000916667) → floor = 357,530
    expect(result.maxHomePrice).toBe(357_530)
    expect(result.loanAmount).toBe(297_530)
    expect(result.principalAndInterest).toBeCloseTo(1880.59, 2)
    expect(result.monthlyPropertyTax).toBeCloseTo(327.74, 2)
    expect(result.monthlyHomeInsurance).toBe(125)
    expect(result.isValid).toBe(true)
  })

  it('never lets the payment at the maximum price exceed the housing limit', () => {
    const result = calculateHomeAffordability(baseInput)
    expect(result.totalMonthlyPayment).toBeLessThanOrEqual(result.maxMonthlyHousingPayment + 0.01)
    expect(result.totalMonthlyPayment).toBeGreaterThan(result.maxMonthlyHousingPayment - 0.05)
  })

  it('switches to the back-end rule when existing debts are high', () => {
    const result = calculateHomeAffordability({ ...baseInput, monthlyDebts: 1_000 })
    // Back-end: 3,000 − 1,000 = 2,000, below the 2,333.33 front-end limit.
    expect(result.bindingRule).toBe('back-end')
    expect(result.maxMonthlyHousingPayment).toBe(2000)
    expect(result.maxHomePrice).toBe(311_473)
    expect(result.backEndRatio).toBeCloseTo(36, 1)
  })

  it('matches a zero-rate, zero-cost case worked by hand', () => {
    const result = calculateHomeAffordability({
      annualIncome: 120_000,
      monthlyDebts: 0,
      downPayment: 0,
      annualRate: 0,
      termYears: 30,
      propertyTaxRate: 0,
      annualHomeInsurance: 0,
    })
    // 28% of 10,000 = 2,800/mo × 360 months = 1,008,000.
    expect(result.maxHomePrice).toBe(1_008_000)
    expect(result.principalAndInterest).toBe(2800)
  })

  it('adds the down payment one-for-one to the affordable price', () => {
    const noDown = calculateHomeAffordability({ ...baseInput, propertyTaxRate: 0, downPayment: 0 })
    const withDown = calculateHomeAffordability({ ...baseInput, propertyTaxRate: 0, downPayment: 50_000 })
    expect(withDown.maxHomePrice - noDown.maxHomePrice).toBeGreaterThanOrEqual(49_999)
    expect(withDown.maxHomePrice - noDown.maxHomePrice).toBeLessThanOrEqual(50_001)
  })

  it('reduces the price when HOA fees are added', () => {
    const base = calculateHomeAffordability(baseInput)
    const withHoa = calculateHomeAffordability({ ...baseInput, monthlyHoa: 300 })
    expect(withHoa.maxHomePrice).toBeLessThan(base.maxHomePrice)
  })

  it('returns an invalid result when debts consume the whole back-end budget', () => {
    const result = calculateHomeAffordability({ ...baseInput, monthlyDebts: 5_000 })
    expect(result.backEndLimit).toBe(0)
    expect(result.maxHomePrice).toBe(0)
    expect(result.isValid).toBe(false)
  })

  it('returns an invalid result for zero income', () => {
    const result = calculateHomeAffordability({ ...baseInput, annualIncome: 0 })
    expect(result.isValid).toBe(false)
    expect(result.maxHomePrice).toBe(0)
    expect(Number.isFinite(result.frontEndRatio)).toBe(true)
  })

  it('handles a down payment larger than any affordable loan (cash buyer)', () => {
    const result = calculateHomeAffordability({ ...baseInput, downPayment: 5_000_000 })
    // Budget after insurance: 2,208.33/mo, all of it property tax at 1.1%/yr.
    expect(result.maxHomePrice).toBe(Math.floor(2208.333333 / (0.011 / 12)))
    expect(result.loanAmount).toBe(0)
  })

  it('handles large numbers without NaN or Infinity', () => {
    const result = calculateHomeAffordability({ ...baseInput, annualIncome: 50_000_000 })
    expect(Number.isFinite(result.maxHomePrice)).toBe(true)
    expect(Number.isFinite(result.totalMonthlyPayment)).toBe(true)
  })
})
