import { describe, expect, it } from 'vitest'
import { calculateCagr, calculateRoi, calculateSimpleInterest } from '@/lib/calculators/roi'

describe('calculateRoi', () => {
  it('calculates a basic profit', () => {
    const result = calculateRoi({ initialInvestment: 10_000, finalValue: 15_000 })
    expect(result.netProfit).toBe(5000)
    expect(result.roi).toBe(50)
    expect(result.isProfit).toBe(true)
  })

  it('includes additional costs in the invested total', () => {
    const result = calculateRoi({
      initialInvestment: 10_000,
      finalValue: 15_000,
      additionalCosts: 1000,
    })
    expect(result.totalInvested).toBe(11_000)
    expect(result.netProfit).toBe(4000)
  })

  it('includes income received in the returned total', () => {
    const result = calculateRoi({
      initialInvestment: 10_000,
      finalValue: 12_000,
      incomeReceived: 500,
    })
    expect(result.totalReturned).toBe(12_500)
  })

  it('reports a negative ROI on a loss', () => {
    const result = calculateRoi({ initialInvestment: 10_000, finalValue: 8_000 })
    expect(result.netProfit).toBeLessThan(0)
    expect(result.roi).toBeLessThan(0)
    expect(result.isProfit).toBe(false)
  })

  it('annualizes ROI using the geometric formula, not a linear division', () => {
    // 100% return over 24 months should be well below a naive 50%/year.
    const result = calculateRoi({
      initialInvestment: 10_000,
      finalValue: 20_000,
      holdingPeriodMonths: 24,
    })
    expect(result.roi).toBe(100)
    expect(result.annualizedRoi).toBeCloseTo(41.42, 1)
  })

  it('returns an invalid result for a zero investment', () => {
    const result = calculateRoi({ initialInvestment: 0, finalValue: 5000 })
    expect(result.isValid).toBe(false)
  })

  it('handles a total loss (final value of zero)', () => {
    const result = calculateRoi({ initialInvestment: 10_000, finalValue: 0 })
    expect(result.roi).toBe(-100)
    expect(result.annualizedRoi).toBe(0)
  })

  it('handles decimal values precisely', () => {
    const result = calculateRoi({ initialInvestment: 1234.56, finalValue: 1500.789 })
    expect(Number.isFinite(result.roi)).toBe(true)
  })
})

describe('calculateCagr', () => {
  it('computes the compound annual growth rate', () => {
    // 10,000 -> 20,000 over 5 years
    expect(calculateCagr(10_000, 20_000, 5)).toBeCloseTo(14.87, 1)
  })

  it('returns zero for a zero starting value', () => {
    expect(calculateCagr(0, 20_000, 5)).toBe(0)
  })

  it('returns -100 for a total loss', () => {
    expect(calculateCagr(10_000, 0, 5)).toBe(-100)
  })

  it('returns zero for a zero time period', () => {
    expect(calculateCagr(10_000, 20_000, 0)).toBe(0)
  })
})

describe('calculateSimpleInterest', () => {
  it('computes simple (non-compounding) interest', () => {
    const result = calculateSimpleInterest(1000, 5, 3)
    expect(result.interest).toBe(150)
    expect(result.total).toBe(1150)
  })

  it('handles a zero rate', () => {
    const result = calculateSimpleInterest(1000, 0, 3)
    expect(result.interest).toBe(0)
  })

  it('handles a zero term', () => {
    const result = calculateSimpleInterest(1000, 5, 0)
    expect(result.interest).toBe(0)
  })
})
