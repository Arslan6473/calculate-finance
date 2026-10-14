import { describe, expect, it } from 'vitest'
import { calculateDebtToIncome } from '@/lib/calculators/debtToIncome'

const baseInput = {
  grossMonthlyIncome: 7_000,
  otherMonthlyIncome: 500,
  housingPayment: 1_900,
  carLoans: 450,
  studentLoans: 300,
  creditCardMinimums: 150,
  otherDebts: 0,
}

describe('calculateDebtToIncome', () => {
  it('matches the worked example in the content', () => {
    const result = calculateDebtToIncome(baseInput)
    expect(result.totalMonthlyIncome).toBe(7_500)
    expect(result.totalMonthlyDebt).toBe(2_800)
    // 1,900 ÷ 7,500 and 2,800 ÷ 7,500.
    expect(result.frontEndDti).toBe(25.33)
    expect(result.backEndDti).toBe(37.33)
    expect(result.band).toBe('between-36-43')
    expect(result.debtAt36).toBe(2_700)
    expect(result.cutTo36).toBe(100)
    expect(result.roomTo36).toBe(0)
    expect(result.isValid).toBe(true)
  })

  it('reports room to add debt when below 36%', () => {
    const result = calculateDebtToIncome({ ...baseInput, carLoans: 0 })
    // 2,350 ÷ 7,500 = 31.33%; 2,700 − 2,350 = 350 of room.
    expect(result.backEndDti).toBe(31.33)
    expect(result.band).toBe('within-36')
    expect(result.roomTo36).toBe(350)
    expect(result.cutTo36).toBe(0)
  })

  it('treats exactly 36% as within the guideline and exactly 43% as within the QM reference', () => {
    expect(calculateDebtToIncome({ grossMonthlyIncome: 10_000, housingPayment: 3_600 }).band).toBe('within-36')
    expect(calculateDebtToIncome({ grossMonthlyIncome: 10_000, housingPayment: 4_300 }).band).toBe('between-36-43')
    expect(calculateDebtToIncome({ grossMonthlyIncome: 10_000, housingPayment: 4_301 }).band).toBe('above-43')
  })

  it('counts only housing in the front-end ratio', () => {
    const result = calculateDebtToIncome({ grossMonthlyIncome: 5_000, housingPayment: 1_000, carLoans: 1_000 })
    expect(result.frontEndDti).toBe(20)
    expect(result.backEndDti).toBe(40)
  })

  it('returns an invalid result for zero income without NaN', () => {
    const result = calculateDebtToIncome({ ...baseInput, grossMonthlyIncome: 0, otherMonthlyIncome: 0 })
    expect(result.isValid).toBe(false)
    expect(result.backEndDti).toBe(0)
    expect(result.cutTo36).toBe(0)
  })

  it('ignores negative and non-numeric inputs', () => {
    const result = calculateDebtToIncome({
      grossMonthlyIncome: 6_000,
      housingPayment: -500,
      carLoans: Number.NaN,
    })
    expect(result.totalMonthlyDebt).toBe(0)
    expect(result.backEndDti).toBe(0)
  })
})
