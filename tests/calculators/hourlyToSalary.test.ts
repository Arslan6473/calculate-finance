import { describe, expect, it } from 'vitest'
import { calculateHourlyToSalary } from '@/lib/calculators/hourlyToSalary'

describe('calculateHourlyToSalary', () => {
  it('converts $25/hour on a standard full-time schedule', () => {
    const result = calculateHourlyToSalary({
      direction: 'hourly',
      hourlyRate: 25,
      annualSalary: 0,
      hoursPerWeek: 40,
      daysPerWeek: 5,
    })
    // 25 × 40 × 52 = 52,000
    expect(result.isValid).toBe(true)
    expect(result.annual).toBe(52_000)
    expect(result.monthly).toBe(4_333.33)
    expect(result.biweekly).toBe(2_000)
    expect(result.weekly).toBe(1_000)
    expect(result.daily).toBe(200)
    expect(result.hourly).toBe(25)
    expect(result.hoursPerYear).toBe(2_080)
  })

  it('removes unpaid weeks from the annual figure but not from a working week', () => {
    const result = calculateHourlyToSalary({
      direction: 'hourly',
      hourlyRate: 25,
      annualSalary: 0,
      hoursPerWeek: 40,
      unpaidWeeksOff: 2,
    })
    // 25 × 40 × 50 = 50,000
    expect(result.paidWeeks).toBe(50)
    expect(result.annual).toBe(50_000)
    expect(result.monthly).toBe(4_166.67)
    expect(result.weekly).toBe(1_000)
  })

  it('converts a $60,000 salary to an hourly rate', () => {
    const result = calculateHourlyToSalary({
      direction: 'annual',
      hourlyRate: 0,
      annualSalary: 60_000,
      hoursPerWeek: 40,
      daysPerWeek: 5,
    })
    // 60,000 / 2,080 = 28.8461…
    expect(result.hourly).toBe(28.85)
    expect(result.annual).toBe(60_000)
    expect(result.monthly).toBe(5_000)
    // 60,000 / 52 = 1,153.846…
    expect(result.weekly).toBe(1_153.85)
    expect(result.biweekly).toBe(2_307.69)
    expect(result.daily).toBe(230.77)
  })

  it('spreads a salary over fewer paid weeks when weeks off are unpaid', () => {
    const result = calculateHourlyToSalary({
      direction: 'annual',
      hourlyRate: 0,
      annualSalary: 60_000,
      hoursPerWeek: 40,
      unpaidWeeksOff: 2,
    })
    // 60,000 / (40 × 50) = 30
    expect(result.hourly).toBe(30)
    expect(result.weekly).toBe(1_200)
  })

  it('ignores the field that does not match the chosen direction', () => {
    const result = calculateHourlyToSalary({
      direction: 'hourly',
      hourlyRate: 20,
      annualSalary: 999_999,
      hoursPerWeek: 40,
    })
    expect(result.annual).toBe(41_600)
  })

  it('returns an invalid, finite result for zero pay or a fully unpaid year', () => {
    const zero = calculateHourlyToSalary({ direction: 'hourly', hourlyRate: 0, annualSalary: 0 })
    expect(zero.isValid).toBe(false)
    expect(zero.annual).toBe(0)

    const unpaidYear = calculateHourlyToSalary({
      direction: 'annual',
      hourlyRate: 0,
      annualSalary: 50_000,
      unpaidWeeksOff: 52,
    })
    expect(unpaidYear.isValid).toBe(false)
    expect(unpaidYear.hourly).toBe(0)
    expect(Number.isFinite(unpaidYear.weekly)).toBe(true)
  })

  it('tolerates garbage input without NaN', () => {
    const result = calculateHourlyToSalary({
      direction: 'hourly',
      hourlyRate: Number.NaN,
      annualSalary: Number.POSITIVE_INFINITY,
      hoursPerWeek: -10,
      daysPerWeek: 0,
    })
    expect(Number.isFinite(result.annual)).toBe(true)
    expect(result.daily).toBe(0)
  })
})
