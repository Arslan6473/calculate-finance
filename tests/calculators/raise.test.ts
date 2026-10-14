import { describe, expect, it } from 'vitest'
import { calculateRaise } from '@/lib/calculators/raise'

describe('calculateRaise', () => {
  it('applies a percentage raise', () => {
    const result = calculateRaise({
      currentSalary: 60_000,
      raiseType: 'percent',
      raisePercent: 4,
      payFrequency: 'biweekly',
      inflationRate: 0,
    })
    expect(result.isValid).toBe(true)
    expect(result.raiseAmount).toBe(2_400)
    expect(result.newSalary).toBe(62_400)
    expect(result.raisePercent).toBe(4)
    expect(result.monthlyIncrease).toBe(200)
    // 2,400 / 26 = 92.307…
    expect(result.perPaycheckIncrease).toBe(92.31)
    expect(result.newPerPaycheck).toBe(2_400)
  })

  it('works out the percentage from a dollar raise', () => {
    const result = calculateRaise({
      currentSalary: 60_000,
      raiseType: 'amount',
      raiseAmount: 2_500,
      raisePercent: 99,
      payFrequency: 'monthly',
    })
    // 2,500 / 60,000 = 4.1666…%
    expect(result.newSalary).toBe(62_500)
    expect(result.raisePercent).toBe(4.17)
    expect(result.monthlyIncrease).toBe(208.33)
    expect(result.perPaycheckIncrease).toBe(208.33)
  })

  it('uses the exact Fisher formula for the real raise', () => {
    const result = calculateRaise({
      currentSalary: 60_000,
      raiseType: 'percent',
      raisePercent: 4,
      inflationRate: 3,
    })
    // 1.04 / 1.03 − 1 = 0.0097087…
    expect(result.realRaisePercent).toBe(0.97)
    // 62,400 / 1.03 = 60,582.524…
    expect(result.realNewSalary).toBe(60_582.52)
    expect(result.beatsInflation).toBe(true)
  })

  it('flags a raise that falls short of inflation', () => {
    const result = calculateRaise({
      currentSalary: 60_000,
      raiseType: 'percent',
      raisePercent: 2,
      inflationRate: 3,
    })
    // 1.02 / 1.03 − 1 = −0.0097087…
    expect(result.realRaisePercent).toBe(-0.97)
    expect(result.beatsInflation).toBe(false)
  })

  it('treats the real raise as the nominal raise when inflation is zero', () => {
    const result = calculateRaise({
      currentSalary: 80_000,
      raiseType: 'percent',
      raisePercent: 5,
      inflationRate: 0,
    })
    expect(result.realRaisePercent).toBe(5)
    expect(result.realNewSalary).toBe(84_000)
  })

  it('returns an invalid, finite result for a zero salary', () => {
    const result = calculateRaise({
      currentSalary: 0,
      raiseType: 'amount',
      raiseAmount: 1_000,
    })
    expect(result.isValid).toBe(false)
    expect(result.raisePercent).toBe(0)
    expect(Number.isFinite(result.realRaisePercent)).toBe(true)
  })

  it('never produces NaN from garbage or nonsensical inflation', () => {
    const result = calculateRaise({
      currentSalary: Number.NaN,
      raiseType: 'percent',
      raisePercent: Number.POSITIVE_INFINITY,
      inflationRate: -150,
    })
    expect(Number.isFinite(result.newSalary)).toBe(true)
    expect(Number.isFinite(result.realRaisePercent)).toBe(true)
  })
})
