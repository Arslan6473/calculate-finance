import { describe, expect, it } from 'vitest'
import { calculateRentAffordability } from '@/lib/calculators/rentAffordability'

describe('calculateRentAffordability', () => {
  it('computes every rule for a worked example', () => {
    const result = calculateRentAffordability({
      grossIncome: 60_000,
      incomeFrequency: 'annual',
      monthlyDebts: 400,
      rentSharePercent: 30,
      takeHomePercent: 75,
      monthlyEssentials: 500,
    })
    // Gross 5,000/mo; take-home 3,750/mo.
    expect(result.grossMonthlyIncome).toBe(5000)
    expect(result.takeHomeMonthlyIncome).toBe(3750)
    expect(result.byIncomeShare).toBe(1500) // 30% × 5,000
    expect(result.byIncomeMultiple).toBe(1500) // 60,000 ÷ 40
    expect(result.byDebtToIncome).toBe(1400) // 36% × 5,000 − 400
    expect(result.byNeedsBudget).toBe(975) // 50% × 3,750 − 400 − 500
    expect(result.recommendedMaxRent).toBe(975)
    expect(result.limitingRule).toBe('needsBudget')
    expect(result.incomeNeededFor40x).toBe(39_000)
    expect(result.isValid).toBe(true)
  })

  it('lets debts set the limit when there are no other essentials', () => {
    const result = calculateRentAffordability({ grossIncome: 60_000, monthlyDebts: 400 })
    // Needs budget: 1,875 − 400 = 1,475; DTI: 1,400 is lower.
    expect(result.byNeedsBudget).toBe(1475)
    expect(result.recommendedMaxRent).toBe(1400)
    expect(result.limitingRule).toBe('debtToIncome')
  })

  it('treats a monthly income the same as the equivalent annual income', () => {
    const annual = calculateRentAffordability({ grossIncome: 72_000, incomeFrequency: 'annual' })
    const monthly = calculateRentAffordability({ grossIncome: 6_000, incomeFrequency: 'monthly' })
    expect(monthly).toEqual(annual)
    expect(monthly.byIncomeShare).toBe(1800)
  })

  it('shows the 40× rule equals rent at 30% of gross income', () => {
    const result = calculateRentAffordability({ grossIncome: 85_000, rentSharePercent: 30 })
    expect(result.byIncomeMultiple).toBe(result.byIncomeShare)
  })

  it('respects a custom target rent share', () => {
    const result = calculateRentAffordability({ grossIncome: 60_000, rentSharePercent: 25 })
    expect(result.byIncomeShare).toBe(1250)
    expect(result.limitingRule).toBe('incomeShare')
  })

  it('floors debt-based figures at zero instead of going negative', () => {
    const result = calculateRentAffordability({ grossIncome: 24_000, monthlyDebts: 2_000 })
    expect(result.byDebtToIncome).toBe(0)
    expect(result.byNeedsBudget).toBe(0)
    expect(result.recommendedMaxRent).toBe(0)
  })

  it('returns an invalid, zeroed result for zero income', () => {
    const result = calculateRentAffordability({ grossIncome: 0 })
    expect(result.isValid).toBe(false)
    expect(result.recommendedMaxRent).toBe(0)
  })

  it('clamps negative inputs rather than producing NaN', () => {
    const result = calculateRentAffordability({
      grossIncome: -50_000,
      monthlyDebts: -300,
      rentSharePercent: -10,
    })
    expect(Number.isFinite(result.recommendedMaxRent)).toBe(true)
    expect(result.recommendedMaxRent).toBe(0)
  })
})
