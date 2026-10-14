import { describe, expect, it } from 'vitest'
import { calculateAutoLoan } from '@/lib/calculators/autoLoan'
import { calculateLoan } from '@/lib/calculators/loan'

const baseInput = {
  vehiclePrice: 35_000,
  downPayment: 5_000,
  tradeInValue: 8_000,
  tradeInOwed: 10_000,
  salesTaxRate: 7,
  fees: 800,
  financeTaxAndFees: true,
  annualRate: 7,
  termMonths: 60,
}

describe('calculateAutoLoan', () => {
  it('matches the worked example in the content', () => {
    const result = calculateAutoLoan(baseInput)
    // Tax on 35,000 − 8,000 = 27,000 × 7% = 1,890.
    expect(result.taxableAmount).toBe(27_000)
    expect(result.salesTax).toBe(1_890)
    expect(result.negativeEquity).toBe(2_000)
    // 35,000 − 5,000 − 8,000 + 10,000 + 1,890 + 800 = 34,690.
    expect(result.amountFinanced).toBe(34_690)
    expect(result.monthlyPayment).toBe(686.9)
    expect(result.totalInterest).toBeCloseTo(6524.21, 2)
    expect(result.totalOfPayments).toBeCloseTo(41_214, 2)
    expect(result.totalCost).toBeCloseTo(46_214, 2)
    expect(result.upfrontCash).toBe(5_000)
    expect(result.isValid).toBe(true)
  })

  it('agrees with the general loan engine on the same principal', () => {
    const auto = calculateAutoLoan(baseInput)
    const loan = calculateLoan({ loanAmount: 34_690, annualRate: 7, termMonths: 60 })
    expect(auto.monthlyPayment).toBe(loan.monthlyPayment)
    expect(auto.totalInterest).toBe(loan.totalInterest)
  })

  it('moves tax and fees to cash at signing when not financed', () => {
    const result = calculateAutoLoan({ ...baseInput, financeTaxAndFees: false })
    expect(result.amountFinanced).toBe(32_000)
    expect(result.upfrontCash).toBe(7_690)
    expect(result.monthlyPayment).toBe(633.64)
  })

  it('reduces the amount financed by positive trade-in equity', () => {
    const result = calculateAutoLoan({ ...baseInput, tradeInOwed: 0 })
    expect(result.negativeEquity).toBe(0)
    expect(result.tradeInEquity).toBe(8_000)
    expect(result.amountFinanced).toBe(24_690)
  })

  it('costs more interest over a longer term', () => {
    const sixty = calculateAutoLoan(baseInput)
    const seventyTwo = calculateAutoLoan({ ...baseInput, termMonths: 72 })
    expect(seventyTwo.monthlyPayment).toBe(591.43)
    expect(seventyTwo.totalInterest).toBeGreaterThan(sixty.totalInterest)
  })

  it('never taxes a negative amount when the trade-in exceeds the price', () => {
    const result = calculateAutoLoan({ ...baseInput, tradeInValue: 40_000, tradeInOwed: 0 })
    expect(result.taxableAmount).toBe(0)
    expect(result.salesTax).toBe(0)
  })

  it('returns an invalid result when cash and trade-in cover everything', () => {
    const result = calculateAutoLoan({ ...baseInput, downPayment: 50_000 })
    expect(result.amountFinanced).toBe(0)
    expect(result.monthlyPayment).toBe(0)
    expect(result.isValid).toBe(false)
  })

  it('handles a zero interest rate', () => {
    const result = calculateAutoLoan({ ...baseInput, annualRate: 0, termMonths: 36, fees: 0, salesTaxRate: 0, tradeInOwed: 8_000 })
    // 35,000 − 5,000 − 8,000 + 8,000 = 30,000 over 36 months.
    expect(result.monthlyPayment).toBeCloseTo(833.33, 2)
    expect(result.totalInterest).toBe(0)
  })

  it('survives garbage input without NaN', () => {
    const result = calculateAutoLoan({
      vehiclePrice: Number.NaN,
      annualRate: Number.POSITIVE_INFINITY,
      termMonths: -5,
    })
    expect(result.isValid).toBe(false)
    expect(Number.isFinite(result.totalCost)).toBe(true)
  })
})
