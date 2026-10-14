import { describe, expect, it } from 'vitest'
import { calculateSavingsGoal } from '@/lib/calculators/savingsGoal'
import { calculateCompoundInterest } from '@/lib/calculators/compoundInterest'

describe('calculateSavingsGoal', () => {
  it('solves the required monthly deposit (worked example in the article)', () => {
    const result = calculateSavingsGoal({
      goalAmount: 50_000,
      currentSavings: 5_000,
      termYears: 10,
      annualRate: 5,
      compoundFrequency: 'monthly',
      contributionTiming: 'end',
    })
    expect(result.isValid).toBe(true)
    // 5,000 × (1 + 0.05/12)^120 = 8,235.05
    expect(result.currentSavingsFutureValue).toBe(8_235.05)
    // (50,000 − 8,235.05) ÷ (((1.0041667^120 − 1) ÷ 0.0041667) = 155.28)
    expect(result.monthlyContribution).toBe(268.96)
    expect(result.totalContributed).toBe(37_275.38)
    expect(result.interestEarned).toBe(12_724.62)
    expect(result.projectedBalance).toBe(50_000)
    expect(result.yearly).toHaveLength(10)
    expect(result.yearly[9].balance).toBe(50_000)
  })

  it('agrees with the compound interest engine when the deposit is fed back in', () => {
    const goal = calculateSavingsGoal({
      goalAmount: 50_000,
      currentSavings: 5_000,
      termYears: 10,
      annualRate: 5,
      compoundFrequency: 'monthly',
    })
    const check = calculateCompoundInterest({
      principal: 5_000,
      annualRate: 5,
      termYears: 10,
      compoundFrequency: 'monthly',
      contribution: goal.monthlyContribution,
      contributionFrequency: 'monthly',
    })
    // Off only by the rounding of the deposit to cents.
    expect(Math.abs(check.finalBalance - 50_000)).toBeLessThan(1)
  })

  it('needs a smaller deposit when saving at the start of each month', () => {
    const result = calculateSavingsGoal({
      goalAmount: 50_000,
      currentSavings: 5_000,
      termYears: 10,
      annualRate: 5,
      contributionTiming: 'start',
    })
    // 268.96 ÷ (1 + 0.05/12)
    expect(result.monthlyContribution).toBe(267.85)
  })

  it('spreads the shortfall evenly at a 0% rate', () => {
    const result = calculateSavingsGoal({
      goalAmount: 50_000,
      currentSavings: 5_000,
      termYears: 10,
      annualRate: 0,
    })
    expect(result.monthlyContribution).toBe(375)
    expect(result.interestEarned).toBe(0)
    expect(result.projectedBalance).toBe(50_000)
  })

  it('needs nothing when the goal is already reached', () => {
    const result = calculateSavingsGoal({
      goalAmount: 10_000,
      currentSavings: 12_000,
      termYears: 5,
      annualRate: 4,
    })
    expect(result.goalAlreadyReached).toBe(true)
    expect(result.monthlyContribution).toBe(0)
  })

  it('needs nothing when current savings will grow to the goal on their own', () => {
    const result = calculateSavingsGoal({
      goalAmount: 10_000,
      currentSavings: 8_000,
      termYears: 10,
      annualRate: 5,
    })
    expect(result.goalAlreadyReached).toBe(false)
    expect(result.onTrackWithoutContributions).toBe(true)
    expect(result.monthlyContribution).toBe(0)
    expect(result.projectedBalance).toBeGreaterThan(10_000)
  })

  it('handles annual compounding with monthly deposits', () => {
    const result = calculateSavingsGoal({
      goalAmount: 20_000,
      currentSavings: 0,
      termYears: 3,
      annualRate: 6,
      compoundFrequency: 'annually',
    })
    expect(result.isValid).toBe(true)
    expect(Math.abs(result.projectedBalance - 20_000)).toBeLessThan(0.05)
    expect(result.monthlyContribution).toBeLessThan(20_000 / 36)
  })

  it('returns an invalid, finite result for a zero goal, zero term, or garbage input', () => {
    expect(calculateSavingsGoal({ goalAmount: 0, termYears: 10, annualRate: 5 }).isValid).toBe(false)
    expect(calculateSavingsGoal({ goalAmount: 1_000, termYears: 0, annualRate: 5 }).isValid).toBe(false)
    const garbage = calculateSavingsGoal({
      goalAmount: Number.NaN,
      currentSavings: Number.POSITIVE_INFINITY,
      termYears: Number.NaN,
      annualRate: Number.NaN,
    })
    expect(Number.isFinite(garbage.monthlyContribution)).toBe(true)
    expect(Number.isFinite(garbage.projectedBalance)).toBe(true)
  })
})
