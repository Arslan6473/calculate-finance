import { describe, expect, it } from 'vitest'
import { calculateRetirement } from '@/lib/calculators/retirement'

describe('calculateRetirement', () => {
  it('projects savings growth to retirement age', () => {
    const result = calculateRetirement({
      currentAge: 30,
      retirementAge: 65,
      currentSavings: 20_000,
      monthlyContribution: 500,
      preRetirementReturn: 7,
    })
    expect(result.isValid).toBe(true)
    expect(result.yearsToRetirement).toBe(35)
    expect(result.balanceAtRetirement).toBeGreaterThan(result.totalContributed)
  })

  it('adds employer match to the contribution', () => {
    const noMatch = calculateRetirement({
      currentAge: 30,
      retirementAge: 65,
      currentSavings: 0,
      monthlyContribution: 500,
      preRetirementReturn: 6,
    })
    const withMatch = calculateRetirement({
      currentAge: 30,
      retirementAge: 65,
      currentSavings: 0,
      monthlyContribution: 500,
      preRetirementReturn: 6,
      employerMatchPercent: 50,
    })
    expect(withMatch.balanceAtRetirement).toBeGreaterThan(noMatch.balanceAtRetirement)
    expect(withMatch.totalEmployerMatch).toBeGreaterThan(0)
  })

  it('detects when the portfolio runs out during retirement', () => {
    const result = calculateRetirement({
      currentAge: 60,
      retirementAge: 62,
      currentSavings: 50_000,
      monthlyContribution: 0,
      preRetirementReturn: 4,
      postRetirementReturn: 3,
      desiredAnnualIncome: 80_000,
      lifeExpectancy: 90,
    })
    expect(result.moneyRunsOutAtAge).not.toBeNull()
    expect(result.moneyRunsOutAtAge!).toBeGreaterThan(62)
  })

  it('reports on track when the portfolio comfortably exceeds the target', () => {
    const result = calculateRetirement({
      currentAge: 25,
      retirementAge: 65,
      currentSavings: 10_000,
      monthlyContribution: 2000,
      preRetirementReturn: 7,
      postRetirementReturn: 5,
      desiredAnnualIncome: 40_000,
      lifeExpectancy: 90,
    })
    expect(result.onTrack).toBe(true)
    expect(result.surplusOrShortfall).toBeGreaterThan(0)
  })

  it('returns an invalid result when retirement age is not after current age', () => {
    const result = calculateRetirement({
      currentAge: 65,
      retirementAge: 60,
      currentSavings: 10_000,
      monthlyContribution: 500,
      preRetirementReturn: 6,
    })
    expect(result.isValid).toBe(false)
  })

  it('returns an invalid, flat result with no savings and no contribution', () => {
    const result = calculateRetirement({
      currentAge: 30,
      retirementAge: 65,
      currentSavings: 0,
      monthlyContribution: 0,
      preRetirementReturn: 6,
    })
    expect(result.isValid).toBe(false)
  })

  it('handles a zero return by growing balance purely from contributions', () => {
    const result = calculateRetirement({
      currentAge: 30,
      retirementAge: 32,
      currentSavings: 1000,
      monthlyContribution: 100,
      preRetirementReturn: 0,
    })
    expect(result.balanceAtRetirement).toBeCloseTo(1000 + 100 * 24, 0)
  })

  it('handles large numbers without NaN or Infinity', () => {
    const result = calculateRetirement({
      currentAge: 25,
      retirementAge: 65,
      currentSavings: 1e9,
      monthlyContribution: 1e6,
      preRetirementReturn: 10,
      desiredAnnualIncome: 1e8,
    })
    expect(Number.isFinite(result.balanceAtRetirement)).toBe(true)
    expect(Number.isFinite(result.targetPortfolio)).toBe(true)
  })
})
