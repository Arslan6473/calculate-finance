import { describe, expect, it } from 'vitest'
import { calculateInvestment } from '@/lib/calculators/investment'

describe('calculateInvestment', () => {
  it('grows an initial investment with monthly contributions', () => {
    const result = calculateInvestment({
      initialInvestment: 10_000,
      monthlyContribution: 500,
      annualReturn: 7,
      termYears: 20,
    })
    expect(result.isValid).toBe(true)
    expect(result.finalBalance).toBeGreaterThan(result.totalContributed)
    expect(result.yearly).toHaveLength(20)
  })

  it('deducts fees from the net return', () => {
    const noFee = calculateInvestment({
      initialInvestment: 10_000,
      monthlyContribution: 0,
      annualReturn: 8,
      termYears: 10,
    })
    const withFee = calculateInvestment({
      initialInvestment: 10_000,
      monthlyContribution: 0,
      annualReturn: 8,
      termYears: 10,
      annualFeePercent: 1,
    })
    expect(withFee.finalBalance).toBeLessThan(noFee.finalBalance)
    expect(withFee.totalFees).toBeGreaterThan(0)
  })

  it('escalates the contribution annually when requested', () => {
    const flat = calculateInvestment({
      initialInvestment: 0,
      monthlyContribution: 500,
      annualReturn: 6,
      termYears: 10,
    })
    const escalating = calculateInvestment({
      initialInvestment: 0,
      monthlyContribution: 500,
      annualReturn: 6,
      termYears: 10,
      annualContributionIncrease: 5,
    })
    expect(escalating.totalContributed).toBeGreaterThan(flat.totalContributed)
  })

  it('discounts the final balance for inflation', () => {
    const result = calculateInvestment({
      initialInvestment: 10_000,
      monthlyContribution: 0,
      annualReturn: 7,
      termYears: 20,
      inflationRate: 3,
    })
    expect(result.realFinalBalance).toBeLessThan(result.finalBalance)
  })

  it('handles a zero return as pure contribution accumulation', () => {
    const result = calculateInvestment({
      initialInvestment: 1000,
      monthlyContribution: 100,
      annualReturn: 0,
      termYears: 2,
    })
    expect(result.totalGrowth).toBe(0)
  })

  it('returns an invalid, flat result with no investment and no contribution', () => {
    const result = calculateInvestment({
      initialInvestment: 0,
      monthlyContribution: 0,
      annualReturn: 7,
      termYears: 20,
    })
    expect(result.isValid).toBe(false)
  })

  it('handles a negative return, shrinking the balance without going negative', () => {
    const result = calculateInvestment({
      initialInvestment: 10_000,
      monthlyContribution: 0,
      annualReturn: -15,
      termYears: 10,
    })
    expect(result.finalBalance).toBeLessThan(10_000)
    expect(result.finalBalance).toBeGreaterThanOrEqual(0)
  })

  it('handles large numbers without producing NaN or Infinity', () => {
    const result = calculateInvestment({
      initialInvestment: 1e11,
      monthlyContribution: 1e6,
      annualReturn: 12,
      termYears: 40,
    })
    expect(Number.isFinite(result.finalBalance)).toBe(true)
  })
})
