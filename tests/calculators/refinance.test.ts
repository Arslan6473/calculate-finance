import { describe, expect, it } from 'vitest'
import { calculateRefinance } from '@/lib/calculators/refinance'

const baseInput = {
  currentBalance: 300_000,
  currentRate: 7,
  remainingYears: 25,
  newRate: 6,
  newTermYears: 30,
  closingCosts: 6_000,
  rollCostsIntoLoan: false,
}

describe('calculateRefinance', () => {
  it('matches the worked example: lower payment, but a reset term costs more overall', () => {
    const result = calculateRefinance(baseInput)
    expect(result.currentMonthlyPayment).toBe(2120.34)
    expect(result.newMonthlyPayment).toBe(1798.65)
    expect(result.monthlySavings).toBe(321.69)
    // 6,000 ÷ 321.69 = 18.65 → 19 months.
    expect(result.breakEvenMonths).toBe(19)
    expect(result.currentTotalInterest).toBeCloseTo(336_101.28, 2)
    expect(result.newTotalInterest).toBeCloseTo(347_514.57, 2)
    expect(result.currentTotalPaid).toBeCloseTo(636_102, 2)
    expect(result.newTotalCost).toBeCloseTo(653_514, 2)
    expect(result.lifetimeNetSavings).toBeCloseTo(-17_412, 2)
    expect(result.termExtensionMonths).toBe(60)
    expect(result.isValid).toBe(true)
  })

  it('reports no break-even when a shorter term raises the payment, yet saves overall', () => {
    const result = calculateRefinance({ ...baseInput, newTermYears: 20 })
    expect(result.newMonthlyPayment).toBe(2149.29)
    expect(result.monthlySavings).toBe(-28.95)
    expect(result.breakEvenMonths).toBeNull()
    expect(result.newTotalCost).toBeCloseTo(521_829.6, 2)
    expect(result.lifetimeNetSavings).toBeCloseTo(114_272.4, 2)
  })

  it('adds rolled-in closing costs to the balance and not again as cash', () => {
    const cash = calculateRefinance(baseInput)
    const rolled = calculateRefinance({ ...baseInput, rollCostsIntoLoan: true })
    expect(rolled.newLoanAmount).toBe(306_000)
    expect(rolled.newMonthlyPayment).toBeGreaterThan(cash.newMonthlyPayment)
    expect(rolled.newTotalCost).toBeCloseTo(rolled.newTotalInterest + 306_000, -1)
    expect(rolled.lifetimeNetSavings).toBeLessThan(cash.lifetimeNetSavings)
  })

  it('breaks even immediately when there are no closing costs and the payment drops', () => {
    const result = calculateRefinance({ ...baseInput, closingCosts: 0 })
    expect(result.breakEvenMonths).toBe(0)
  })

  it('saves money on a same-length term at a lower rate', () => {
    const result = calculateRefinance({ ...baseInput, remainingYears: 30, newTermYears: 30 })
    expect(result.monthlySavings).toBeGreaterThan(0)
    expect(result.lifetimeNetSavings).toBeGreaterThan(0)
  })

  it('returns an invalid, zeroed result for a zero balance', () => {
    const result = calculateRefinance({ ...baseInput, currentBalance: 0 })
    expect(result.isValid).toBe(false)
    expect(result.monthlySavings).toBe(0)
    expect(result.breakEvenMonths).toBeNull()
  })

  it('handles zero rates', () => {
    const result = calculateRefinance({ ...baseInput, currentRate: 0, newRate: 0, closingCosts: 0, remainingYears: 30 })
    expect(result.currentMonthlyPayment).toBeCloseTo(833.33, 2)
    expect(result.lifetimeNetSavings).toBeCloseTo(0, 0)
  })
})
