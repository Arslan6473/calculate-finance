import { describe, expect, it } from 'vitest'
import { calculateLoan } from '@/lib/calculators/loan'

describe('calculateLoan', () => {
  it('calculates a standard auto loan', () => {
    const result = calculateLoan({ loanAmount: 30_000, annualRate: 7, termMonths: 60 })
    expect(result.isValid).toBe(true)
    expect(result.monthlyPayment).toBeGreaterThan(0)
    expect(result.totalPaid).toBeCloseTo(result.monthlyPayment * 60, 0)
  })

  it('matches the amount disbursed to the loan amount when there is no fee', () => {
    const result = calculateLoan({ loanAmount: 10_000, annualRate: 5, termMonths: 36 })
    expect(result.amountDisbursed).toBe(10_000)
    expect(result.effectiveApr).toBe(5)
  })

  it('raises the effective APR above the nominal rate when an origination fee applies', () => {
    const result = calculateLoan({
      loanAmount: 10_000,
      annualRate: 5,
      termMonths: 36,
      originationFee: 500,
    })
    expect(result.amountDisbursed).toBe(9_500)
    expect(result.effectiveApr).toBeGreaterThan(5)
  })

  it('handles a zero interest rate', () => {
    const result = calculateLoan({ loanAmount: 12_000, annualRate: 0, termMonths: 12 })
    expect(result.monthlyPayment).toBe(1000)
    expect(result.totalInterest).toBe(0)
  })

  it('returns an invalid, zeroed result for a zero loan amount', () => {
    const result = calculateLoan({ loanAmount: 0, annualRate: 7, termMonths: 60 })
    expect(result.isValid).toBe(false)
    expect(result.monthlyPayment).toBe(0)
  })

  it('clamps a negative loan amount to zero', () => {
    const result = calculateLoan({ loanAmount: -5000, annualRate: 7, termMonths: 60 })
    expect(result.isValid).toBe(false)
  })

  it('handles a very large loan without NaN or Infinity', () => {
    const result = calculateLoan({ loanAmount: 5e11, annualRate: 12, termMonths: 360 })
    expect(Number.isFinite(result.monthlyPayment)).toBe(true)
    expect(Number.isFinite(result.effectiveApr)).toBe(true)
  })

  it('shortens payoff with an extra monthly payment', () => {
    const base = calculateLoan({ loanAmount: 20_000, annualRate: 8, termMonths: 48 })
    const extra = calculateLoan({
      loanAmount: 20_000,
      annualRate: 8,
      termMonths: 48,
      extraMonthlyPayment: 150,
    })
    expect(extra.monthsToPayoff).toBeLessThan(base.monthsToPayoff)
  })

  it('caps the origination fee at the loan amount rather than going negative', () => {
    const result = calculateLoan({
      loanAmount: 1000,
      annualRate: 5,
      termMonths: 12,
      originationFee: 5000,
    })
    expect(result.amountDisbursed).toBe(0)
  })
})
