import { describe, expect, it } from 'vitest'
import { calculateOvertime } from '@/lib/calculators/overtime'

describe('calculateOvertime', () => {
  it('pays time and a half on overtime hours', () => {
    const result = calculateOvertime({
      hourlyRate: 22,
      regularHours: 40,
      overtimeHours: 8,
      multiplier: 1.5,
      weeksPerYear: 52,
    })
    expect(result.isValid).toBe(true)
    expect(result.overtimeRate).toBe(33)
    expect(result.regularPay).toBe(880)
    expect(result.overtimePay).toBe(264)
    expect(result.totalWeekly).toBe(1_144)
    expect(result.annualRegularPay).toBe(45_760)
    expect(result.annualOvertimePay).toBe(13_728)
    expect(result.annualTotal).toBe(59_488)
    // 1,144 / 48 hours = 23.833…
    expect(result.effectiveHourlyRate).toBe(23.83)
    // 264 / 1,144 = 23.0769…%
    expect(result.overtimeShare).toBe(23.08)
  })

  it('pays double time when the multiplier is 2', () => {
    const result = calculateOvertime({
      hourlyRate: 22,
      regularHours: 40,
      overtimeHours: 8,
      multiplier: 2,
    })
    expect(result.overtimeRate).toBe(44)
    expect(result.overtimePay).toBe(352)
    expect(result.totalWeekly).toBe(1_232)
    // Defaults to 52 weeks.
    expect(result.annualTotal).toBe(64_064)
  })

  it('annualises over the weeks actually worked', () => {
    const result = calculateOvertime({
      hourlyRate: 22,
      regularHours: 40,
      overtimeHours: 8,
      multiplier: 1.5,
      weeksPerYear: 50,
    })
    expect(result.annualTotal).toBe(57_200)
  })

  it('returns regular pay only when there is no overtime', () => {
    const result = calculateOvertime({
      hourlyRate: 20,
      regularHours: 40,
      overtimeHours: 0,
      multiplier: 1.5,
    })
    expect(result.overtimePay).toBe(0)
    expect(result.totalWeekly).toBe(800)
    expect(result.effectiveHourlyRate).toBe(20)
    expect(result.overtimeShare).toBe(0)
  })

  it('caps combined hours at the 168 hours in a week', () => {
    const result = calculateOvertime({
      hourlyRate: 10,
      regularHours: 160,
      overtimeHours: 50,
      multiplier: 1.5,
    })
    // Only 8 overtime hours fit: 160 × 10 + 8 × 15 = 1,720
    expect(result.totalWeekly).toBe(1_720)
  })

  it('returns an invalid, finite result for garbage input', () => {
    const result = calculateOvertime({
      hourlyRate: Number.NaN,
      regularHours: -5,
      overtimeHours: Number.POSITIVE_INFINITY,
      multiplier: 0,
    })
    expect(result.isValid).toBe(false)
    expect(result.totalWeekly).toBe(0)
    expect(result.effectiveHourlyRate).toBe(0)
  })
})
