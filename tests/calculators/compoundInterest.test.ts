import { describe, expect, it } from 'vitest'
import { calculateCompoundInterest } from '@/lib/calculators/compoundInterest'

describe('calculateCompoundInterest', () => {
  it('compounds annually with no contributions', () => {
    // 1000 at 10% annually for 2 years = 1210
    const result = calculateCompoundInterest({
      principal: 1000,
      annualRate: 10,
      termYears: 2,
      compoundFrequency: 'annually',
    })
    expect(result.finalBalance).toBeCloseTo(1210, 2)
    expect(result.yearly).toHaveLength(2)
  })

  it('compounds monthly and produces more growth than annual compounding at the same rate', () => {
    const annual = calculateCompoundInterest({
      principal: 10_000,
      annualRate: 6,
      termYears: 10,
      compoundFrequency: 'annually',
    })
    const monthly = calculateCompoundInterest({
      principal: 10_000,
      annualRate: 6,
      termYears: 10,
      compoundFrequency: 'monthly',
    })
    expect(monthly.finalBalance).toBeGreaterThan(annual.finalBalance)
  })

  it('adds monthly contributions to the balance', () => {
    const withContribution = calculateCompoundInterest({
      principal: 1000,
      annualRate: 5,
      termYears: 5,
      compoundFrequency: 'monthly',
      contribution: 100,
      contributionFrequency: 'monthly',
    })
    const withoutContribution = calculateCompoundInterest({
      principal: 1000,
      annualRate: 5,
      termYears: 5,
      compoundFrequency: 'monthly',
    })
    expect(withContribution.finalBalance).toBeGreaterThan(withoutContribution.finalBalance)
    expect(withContribution.totalContributed).toBeGreaterThan(1000)
  })

  it('handles a zero rate as pure accumulation of contributions', () => {
    const result = calculateCompoundInterest({
      principal: 1000,
      annualRate: 0,
      termYears: 2,
      compoundFrequency: 'monthly',
      contribution: 100,
      contributionFrequency: 'monthly',
    })
    expect(result.totalInterest).toBe(0)
    expect(result.finalBalance).toBeCloseTo(1000 + 100 * 24, 2)
  })

  it('returns a flat, invalid result for zero principal and zero contribution', () => {
    const result = calculateCompoundInterest({
      principal: 0,
      annualRate: 5,
      termYears: 10,
      compoundFrequency: 'annually',
    })
    expect(result.isValid).toBe(false)
    expect(result.finalBalance).toBe(0)
  })

  it('handles a negative rate without crashing, shrinking the balance', () => {
    const result = calculateCompoundInterest({
      principal: 1000,
      annualRate: -10,
      termYears: 3,
      compoundFrequency: 'annually',
    })
    expect(result.finalBalance).toBeLessThan(1000)
    expect(result.finalBalance).toBeGreaterThanOrEqual(0)
  })

  it('handles decimal rates and principal', () => {
    const result = calculateCompoundInterest({
      principal: 1234.56,
      annualRate: 4.375,
      termYears: 7,
      compoundFrequency: 'quarterly',
    })
    expect(Number.isFinite(result.finalBalance)).toBe(true)
  })

  it('caps an extreme rate/term combination rather than returning Infinity', () => {
    const result = calculateCompoundInterest({
      principal: 1_000_000,
      annualRate: 9999,
      termYears: 50,
      compoundFrequency: 'daily',
    })
    expect(Number.isFinite(result.finalBalance)).toBe(true)
  })
})
