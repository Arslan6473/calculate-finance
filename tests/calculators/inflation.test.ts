import { describe, expect, it } from 'vitest'
import { calculateInflation } from '@/lib/calculators/inflation'

describe('calculateInflation', () => {
  it('projects future cost and purchasing power (worked example in the article)', () => {
    const result = calculateInflation({ amount: 1_000, inflationRate: 3, termYears: 10, mode: 'future' })
    expect(result.isValid).toBe(true)
    // 1,000 × 1.03^10 = 1,343.916…
    expect(result.grownValue).toBe(1_343.92)
    // 1,000 ÷ 1.03^10 = 744.093…
    expect(result.discountedValue).toBe(744.09)
    expect(result.cumulativeInflation).toBe(34.39)
    expect(result.purchasingPowerLoss).toBe(25.59)
    expect(result.yearly).toHaveLength(11)
    expect(result.yearly[0]).toEqual({ year: 0, grownValue: 1_000, discountedValue: 1_000 })
    expect(result.yearly[10].grownValue).toBe(1_343.92)
  })

  it('works out what today’s amount was equivalent to in the past', () => {
    const result = calculateInflation({ amount: 100, inflationRate: 3, termYears: 20, mode: 'past' })
    // 100 ÷ 1.03^20 = 55.367…
    expect(result.discountedValue).toBe(55.37)
  })

  it('leaves values unchanged at 0% inflation', () => {
    const result = calculateInflation({ amount: 500, inflationRate: 0, termYears: 15 })
    expect(result.grownValue).toBe(500)
    expect(result.discountedValue).toBe(500)
    expect(result.cumulativeInflation).toBe(0)
  })

  it('handles deflation', () => {
    const result = calculateInflation({ amount: 1_000, inflationRate: -1, termYears: 5 })
    expect(result.grownValue).toBeLessThan(1_000)
    expect(result.discountedValue).toBeGreaterThan(1_000)
    expect(result.cumulativeInflation).toBeLessThan(0)
  })

  it('rejects inflation of −100% or below and other invalid input without NaN', () => {
    const extreme = calculateInflation({ amount: 1_000, inflationRate: -100, termYears: 5 })
    expect(extreme.isValid).toBe(false)
    const garbage = calculateInflation({ amount: Number.NaN, inflationRate: Number.NaN, termYears: Number.NaN })
    expect(garbage.isValid).toBe(false)
    expect(Number.isFinite(garbage.grownValue)).toBe(true)
  })
})
