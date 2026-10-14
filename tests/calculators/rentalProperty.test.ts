import { describe, expect, it } from 'vitest'
import { calculateRentalProperty } from '@/lib/calculators/rentalProperty'

const baseInput = {
  purchasePrice: 200_000,
  downPaymentPercent: 25,
  closingCosts: 6_000,
  annualRate: 7,
  termYears: 30,
  monthlyRent: 2_000,
  vacancyPercent: 5,
  annualPropertyTax: 3_000,
  annualInsurance: 1_200,
  maintenancePercent: 10,
  managementPercent: 10,
  monthlyHoa: 0,
  monthlyOther: 0,
}

describe('calculateRentalProperty', () => {
  it('matches a worked example computed by hand', () => {
    const result = calculateRentalProperty(baseInput)
    expect(result.downPayment).toBe(50_000)
    expect(result.loanAmount).toBe(150_000)
    expect(result.totalCashInvested).toBe(56_000)
    // 150,000 at 7% over 30 years.
    expect(result.monthlyMortgagePayment).toBe(997.95)

    expect(result.effectiveMonthlyRent).toBe(1900) // 2,000 − 5%
    expect(result.monthlyMaintenance).toBe(200) // 10% of scheduled rent
    expect(result.monthlyManagement).toBe(190) // 10% of collected rent
    // 250 tax + 100 insurance + 200 + 190
    expect(result.monthlyOperatingExpenses).toBe(740)

    expect(result.annualNoi).toBe(13_920) // (1,900 − 740) × 12
    expect(result.monthlyCashFlow).toBe(162.05) // 1,160 − 997.95
    expect(result.annualCashFlow).toBe(1944.6)
    expect(result.capRate).toBe(6.96) // 13,920 ÷ 200,000
    expect(result.cashOnCashReturn).toBe(3.47) // 1,944.60 ÷ 56,000
    expect(result.grossRentMultiplier).toBe(8.33) // 200,000 ÷ 24,000
    expect(result.debtServiceCoverage).toBe(1.16) // 13,920 ÷ 11,975.40
    expect(result.rentToPricePercent).toBe(1)
    expect(result.passesOnePercentRule).toBe(true)
    expect(result.isValid).toBe(true)
  })

  it('reports negative cash flow and a failed 1% rule on a thinner deal', () => {
    const result = calculateRentalProperty({
      ...baseInput,
      purchasePrice: 300_000,
      downPaymentPercent: 20,
      closingCosts: 9_000,
      monthlyRent: 2_500,
      annualPropertyTax: 3_600,
      annualInsurance: 1_500,
      maintenancePercent: 8,
      managementPercent: 8,
    })
    expect(result.monthlyMortgagePayment).toBe(1596.73)
    expect(result.annualNoi).toBe(18_720)
    expect(result.monthlyCashFlow).toBe(-36.73)
    expect(result.capRate).toBe(6.24)
    expect(result.cashOnCashReturn).toBe(-0.64)
    expect(result.passesOnePercentRule).toBe(false)
  })

  it('keeps cap rate independent of financing', () => {
    const leveraged = calculateRentalProperty(baseInput)
    const allCash = calculateRentalProperty({ ...baseInput, downPaymentPercent: 100 })
    expect(allCash.capRate).toBe(leveraged.capRate)
    expect(allCash.monthlyMortgagePayment).toBe(0)
    expect(allCash.debtServiceCoverage).toBeNull()
    // With no loan, cash flow equals NOI.
    expect(allCash.annualCashFlow).toBe(allCash.annualNoi)
  })

  it('handles a zero interest rate', () => {
    const result = calculateRentalProperty({ ...baseInput, annualRate: 0 })
    // 150,000 ÷ 360
    expect(result.monthlyMortgagePayment).toBeCloseTo(416.67, 2)
  })

  it('returns zero ratios instead of dividing by zero when nothing is invested', () => {
    const result = calculateRentalProperty({ ...baseInput, downPaymentPercent: 0, closingCosts: 0 })
    expect(result.totalCashInvested).toBe(0)
    expect(result.cashOnCashReturn).toBe(0)
    expect(Number.isFinite(result.monthlyCashFlow)).toBe(true)
  })

  it('returns an invalid result for a zero purchase price', () => {
    const result = calculateRentalProperty({ ...baseInput, purchasePrice: 0 })
    expect(result.isValid).toBe(false)
    expect(result.capRate).toBe(0)
    expect(result.passesOnePercentRule).toBe(false)
  })

  it('returns an invalid result for zero rent', () => {
    const result = calculateRentalProperty({ ...baseInput, monthlyRent: 0 })
    expect(result.isValid).toBe(false)
    expect(result.grossRentMultiplier).toBe(0)
  })

  it('handles large numbers without NaN or Infinity', () => {
    const result = calculateRentalProperty({ ...baseInput, purchasePrice: 5e7, monthlyRent: 400_000 })
    expect(Number.isFinite(result.annualCashFlow)).toBe(true)
    expect(Number.isFinite(result.cashOnCashReturn)).toBe(true)
  })
})
