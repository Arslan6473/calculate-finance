import { describe, expect, it } from 'vitest'
import { calculateMortgage } from '@/lib/calculators/mortgage'

describe('calculateMortgage', () => {
  it('calculates a standard 30-year mortgage', () => {
    const result = calculateMortgage({
      homePrice: 400_000,
      downPayment: 80_000,
      termYears: 30,
      annualRate: 6.5,
    })
    expect(result.loanAmount).toBe(320_000)
    expect(result.downPaymentPercent).toBe(20)
    // 320,000 at 6.5% / 30yr ≈ 2022.62
    expect(result.principalAndInterest).toBeCloseTo(2022.62, 1)
    expect(result.isValid).toBe(true)
  })

  it('includes property tax, insurance and HOA in the total monthly payment', () => {
    const result = calculateMortgage({
      homePrice: 400_000,
      downPayment: 80_000,
      termYears: 30,
      annualRate: 6.5,
      annualPropertyTax: 4800,
      annualHomeInsurance: 1200,
      monthlyHoa: 50,
    })
    expect(result.monthlyPropertyTax).toBe(400)
    expect(result.monthlyHomeInsurance).toBe(100)
    expect(result.monthlyHoa).toBe(50)
    expect(result.totalMonthlyPayment).toBeCloseTo(
      result.principalAndInterest + 400 + 100 + 50,
      2
    )
  })

  it('applies PMI below 20% down and removes it once equity reaches 20%', () => {
    const result = calculateMortgage({
      homePrice: 300_000,
      downPayment: 15_000, // 5% down
      termYears: 30,
      annualRate: 6,
      pmiRate: 0.5,
    })
    expect(result.monthlyPmi).toBeGreaterThan(0)
    expect(result.pmiMonths).toBeGreaterThan(0)
    expect(result.pmiMonths).toBeLessThan(result.monthsToPayoff)
  })

  it('charges no PMI at 20% down or more', () => {
    const result = calculateMortgage({
      homePrice: 300_000,
      downPayment: 60_000, // 20% down
      termYears: 30,
      annualRate: 6,
      pmiRate: 0.5,
    })
    expect(result.monthlyPmi).toBe(0)
    expect(result.pmiMonths).toBe(0)
  })

  it('handles a zero interest rate by dividing principal evenly', () => {
    const result = calculateMortgage({
      homePrice: 120_000,
      downPayment: 0,
      termYears: 10,
      annualRate: 0,
    })
    expect(result.principalAndInterest).toBe(1000)
    expect(result.totalInterest).toBe(0)
  })

  it('returns a zeroed, invalid result for a zero home price', () => {
    const result = calculateMortgage({
      homePrice: 0,
      downPayment: 0,
      termYears: 30,
      annualRate: 6.5,
    })
    expect(result.isValid).toBe(false)
    expect(result.totalMonthlyPayment).toBe(0)
    expect(Number.isFinite(result.totalMonthlyPayment)).toBe(true)
  })

  it('clamps a down payment larger than the home price rather than going negative', () => {
    const result = calculateMortgage({
      homePrice: 200_000,
      downPayment: 500_000,
      termYears: 30,
      annualRate: 6,
    })
    expect(result.loanAmount).toBe(0)
    expect(result.downPaymentPercent).toBe(100)
  })

  it('handles negative inputs by clamping rather than producing NaN', () => {
    const result = calculateMortgage({
      homePrice: 300_000,
      downPayment: -50_000,
      termYears: 30,
      annualRate: -6,
    })
    expect(Number.isFinite(result.totalMonthlyPayment)).toBe(true)
    expect(result.loanAmount).toBe(300_000)
  })

  it('handles an extremely large home price without producing NaN or Infinity', () => {
    const result = calculateMortgage({
      homePrice: 50_000_000,
      downPayment: 10_000_000,
      termYears: 30,
      annualRate: 7,
    })
    expect(Number.isFinite(result.totalMonthlyPayment)).toBe(true)
    expect(Number.isFinite(result.totalCostOfOwnership)).toBe(true)
  })

  it('shortens payoff time with an extra monthly payment', () => {
    const base = calculateMortgage({
      homePrice: 300_000,
      downPayment: 60_000,
      termYears: 30,
      annualRate: 6,
    })
    const withExtra = calculateMortgage({
      homePrice: 300_000,
      downPayment: 60_000,
      termYears: 30,
      annualRate: 6,
      extraMonthlyPayment: 200,
    })
    expect(withExtra.monthsToPayoff).toBeLessThan(base.monthsToPayoff)
    expect(withExtra.totalInterest).toBeLessThan(base.totalInterest)
  })

  it('handles decimal-precision inputs correctly', () => {
    const result = calculateMortgage({
      homePrice: 356_789.5,
      downPayment: 71_357.9,
      termYears: 15,
      annualRate: 5.125,
    })
    expect(Number.isFinite(result.principalAndInterest)).toBe(true)
    expect(result.schedule[result.schedule.length - 1].balance).toBe(0)
  })
})
