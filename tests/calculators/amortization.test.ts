import { describe, expect, it } from 'vitest'
import { buildAmortizationSchedule, toYearlySchedule } from '@/lib/calculators/amortization'

describe('buildAmortizationSchedule', () => {
  it('matches the standard annuity payment for a normal loan', () => {
    // $200,000 at 6% over 30 years
    const schedule = buildAmortizationSchedule({
      principal: 200_000,
      annualRate: 6,
      totalPeriods: 360,
    })
    expect(schedule.monthlyPayment).toBeCloseTo(1199.1, 1)
    expect(schedule.rows).toHaveLength(360)
  })

  it('ends the schedule at exactly zero balance', () => {
    const schedule = buildAmortizationSchedule({
      principal: 200_000,
      annualRate: 6,
      totalPeriods: 360,
    })
    const last = schedule.rows[schedule.rows.length - 1]
    expect(last.balance).toBe(0)
  })

  it('produces a strictly decreasing balance', () => {
    const schedule = buildAmortizationSchedule({
      principal: 50_000,
      annualRate: 5.5,
      totalPeriods: 60,
    })
    for (let i = 1; i < schedule.rows.length; i++) {
      expect(schedule.rows[i].balance).toBeLessThan(schedule.rows[i - 1].balance)
    }
  })

  it('splits principal evenly at a zero interest rate', () => {
    const schedule = buildAmortizationSchedule({
      principal: 12_000,
      annualRate: 0,
      totalPeriods: 12,
    })
    expect(schedule.monthlyPayment).toBe(1000)
    expect(schedule.totalInterest).toBe(0)
    for (const row of schedule.rows) {
      expect(row.interest).toBe(0)
      expect(row.principal).toBe(1000)
    }
  })

  it('returns an empty schedule for a zero principal', () => {
    const schedule = buildAmortizationSchedule({ principal: 0, annualRate: 6, totalPeriods: 360 })
    expect(schedule.rows).toEqual([])
    expect(schedule.totalInterest).toBe(0)
  })

  it('returns an empty schedule for zero periods', () => {
    const schedule = buildAmortizationSchedule({ principal: 200_000, annualRate: 6, totalPeriods: 0 })
    expect(schedule.rows).toEqual([])
  })

  it('shortens the term when an extra payment is applied', () => {
    const base = buildAmortizationSchedule({ principal: 200_000, annualRate: 6, totalPeriods: 360 })
    const withExtra = buildAmortizationSchedule({
      principal: 200_000,
      annualRate: 6,
      totalPeriods: 360,
      extraMonthlyPayment: 300,
    })
    expect(withExtra.actualPeriods).toBeLessThan(base.actualPeriods)
    expect(withExtra.totalInterest).toBeLessThan(base.totalInterest)
  })

  it('handles a very large loan without producing NaN or Infinity', () => {
    const schedule = buildAmortizationSchedule({
      principal: 1e11,
      annualRate: 9.9,
      totalPeriods: 360,
    })
    expect(Number.isFinite(schedule.monthlyPayment)).toBe(true)
    expect(Number.isFinite(schedule.totalInterest)).toBe(true)
  })

  it('handles decimal rates and principal precisely at the cent', () => {
    const schedule = buildAmortizationSchedule({
      principal: 123_456.78,
      annualRate: 4.375,
      totalPeriods: 180,
    })
    expect(schedule.rows[schedule.rows.length - 1].balance).toBe(0)
  })

  it('clamps a negative principal to zero rather than propagating it', () => {
    const schedule = buildAmortizationSchedule({ principal: -500, annualRate: 6, totalPeriods: 360 })
    expect(schedule.rows).toEqual([])
  })
})

describe('toYearlySchedule', () => {
  it('collapses monthly rows into calendar years', () => {
    const schedule = buildAmortizationSchedule({ principal: 100_000, annualRate: 5, totalPeriods: 24 })
    const yearly = toYearlySchedule(schedule.rows)
    expect(yearly).toHaveLength(2)
    expect(yearly[0].year).toBe(1)
    expect(yearly[1].year).toBe(2)
  })

  it('sums monthly payments within each year', () => {
    const schedule = buildAmortizationSchedule({ principal: 100_000, annualRate: 5, totalPeriods: 12 })
    const yearly = toYearlySchedule(schedule.rows)
    const monthlySum = schedule.rows.reduce((sum, row) => sum + row.payment, 0)
    expect(yearly[0].payment).toBeCloseTo(monthlySum, 1)
  })

  it('returns an empty array for an empty schedule', () => {
    expect(toYearlySchedule([])).toEqual([])
  })
})
