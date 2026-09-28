import { describe, expect, it } from 'vitest'
import { calculateCreditCardPayoff } from '@/lib/calculators/creditCard'

describe('calculateCreditCardPayoff', () => {
  it('pays off a balance with a fixed payment above the minimum', () => {
    const result = calculateCreditCardPayoff({
      balance: 5000,
      annualRate: 22,
      paymentMode: 'fixed',
      fixedPayment: 250,
    })
    expect(result.payoffPossible).toBe(true)
    expect(result.monthsToPayoff).toBeGreaterThan(0)
    expect(result.totalInterest).toBeGreaterThan(0)
  })

  it('demonstrates the minimum-payment trap: minimum-only takes far longer than a fixed payment', () => {
    const fixed = calculateCreditCardPayoff({
      balance: 3000,
      annualRate: 22,
      paymentMode: 'fixed',
      fixedPayment: 250,
    })
    const minimum = calculateCreditCardPayoff({
      balance: 3000,
      annualRate: 22,
      paymentMode: 'minimum',
      minimumPercent: 3,
      minimumFloor: 25,
    })
    expect(minimum.payoffPossible).toBe(true)
    expect(minimum.monthsToPayoff).toBeGreaterThan(fixed.monthsToPayoff)
    expect(minimum.totalInterest).toBeGreaterThan(fixed.totalInterest)
  })

  it('reports payoffPossible: false for a genuine minimum-payment trap beyond 50 years', () => {
    // A 2%-of-balance minimum on a large balance at a high rate can take
    // upwards of 60 years to clear — beyond any calculator's reasonable
    // horizon. The engine must say so rather than silently truncating.
    const result = calculateCreditCardPayoff({
      balance: 5000,
      annualRate: 22,
      paymentMode: 'minimum',
      minimumPercent: 2,
      minimumFloor: 25,
    })
    expect(result.payoffPossible).toBe(false)
    expect(result.monthsToPayoff).toBe(0)
  })

  it('provides a minimum-payment comparison when a fixed payment is used', () => {
    const result = calculateCreditCardPayoff({
      balance: 5000,
      annualRate: 22,
      paymentMode: 'fixed',
      fixedPayment: 250,
    })
    expect(result.minimumComparison).not.toBeNull()
    expect(result.minimumComparison!.totalInterest).toBeGreaterThan(result.totalInterest)
  })

  it('reports payoffPossible: false when the fixed payment cannot cover interest', () => {
    const result = calculateCreditCardPayoff({
      balance: 10_000,
      annualRate: 29.99,
      paymentMode: 'fixed',
      fixedPayment: 50,
    })
    expect(result.payoffPossible).toBe(false)
  })

  it('applies the minimum floor when the percentage-based minimum is smaller', () => {
    const result = calculateCreditCardPayoff({
      balance: 500,
      annualRate: 20,
      paymentMode: 'minimum',
      minimumPercent: 2,
      minimumFloor: 25,
    })
    // 2% of 500 is $10, below the $25 floor, so the floor applies to the first payment.
    expect(result.firstPayment).toBeGreaterThanOrEqual(25)
  })

  it('adds ongoing purchases to the balance', () => {
    const noPurchases = calculateCreditCardPayoff({
      balance: 2000,
      annualRate: 20,
      paymentMode: 'fixed',
      fixedPayment: 200,
    })
    const withPurchases = calculateCreditCardPayoff({
      balance: 2000,
      annualRate: 20,
      paymentMode: 'fixed',
      fixedPayment: 200,
      monthlyPurchases: 100,
    })
    expect(withPurchases.monthsToPayoff).toBeGreaterThanOrEqual(noPurchases.monthsToPayoff)
  })

  it('returns an invalid result for a zero balance', () => {
    const result = calculateCreditCardPayoff({
      balance: 0,
      annualRate: 20,
      paymentMode: 'fixed',
      fixedPayment: 100,
    })
    expect(result.isValid).toBe(false)
  })

  it('handles a zero interest rate', () => {
    const result = calculateCreditCardPayoff({
      balance: 1200,
      annualRate: 0,
      paymentMode: 'fixed',
      fixedPayment: 100,
    })
    expect(result.payoffPossible).toBe(true)
    expect(result.totalInterest).toBe(0)
    expect(result.monthsToPayoff).toBe(12)
  })

  it('handles a large balance without NaN or Infinity', () => {
    const result = calculateCreditCardPayoff({
      balance: 5e6,
      annualRate: 24,
      paymentMode: 'fixed',
      fixedPayment: 1e5,
    })
    expect(Number.isFinite(result.totalInterest)).toBe(true)
  })
})
