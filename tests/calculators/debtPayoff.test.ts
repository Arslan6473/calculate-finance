import { describe, expect, it } from 'vitest'
import { calculateDebtPayoff, compareStrategies } from '@/lib/calculators/debtPayoff'

const debts = [
  { id: 'a', name: 'Credit card', balance: 5000, annualRate: 22, minimumPayment: 100 },
  { id: 'b', name: 'Car loan', balance: 15_000, annualRate: 6, minimumPayment: 300 },
  { id: 'c', name: 'Store card', balance: 1000, annualRate: 27, minimumPayment: 30 },
]

describe('calculateDebtPayoff', () => {
  it('pays off all debts given a reasonable extra payment', () => {
    const result = calculateDebtPayoff({ debts, strategy: 'avalanche', extraMonthlyPayment: 200 })
    expect(result.payoffPossible).toBe(true)
    expect(result.monthsToPayoff).toBeGreaterThan(0)
    expect(result.debtSummaries).toHaveLength(3)
  })

  it('avalanche targets the highest-rate debt first', () => {
    const result = calculateDebtPayoff({ debts, strategy: 'avalanche', extraMonthlyPayment: 200 })
    const first = result.debtSummaries[0]
    expect(first.id).toBe('c') // 27% rate, cleared first
  })

  it('snowball targets the smallest-balance debt first', () => {
    const result = calculateDebtPayoff({ debts, strategy: 'snowball', extraMonthlyPayment: 200 })
    const first = result.debtSummaries[0]
    expect(first.id).toBe('c') // smallest balance
  })

  it('avalanche never costs more total interest than snowball on the same debts', () => {
    const comparison = compareStrategies({ debts, extraMonthlyPayment: 200 })
    expect(comparison.snowballExtraInterest).toBeGreaterThanOrEqual(0)
    expect(comparison.avalanche.totalInterest).toBeLessThanOrEqual(comparison.snowball.totalInterest)
  })

  it('reports payoffPossible: false when payments cannot cover interest', () => {
    const impossible = [
      { id: 'a', name: 'Maxed card', balance: 20_000, annualRate: 29.99, minimumPayment: 10 },
    ]
    const result = calculateDebtPayoff({ debts: impossible, strategy: 'avalanche' })
    expect(result.payoffPossible).toBe(false)
    expect(result.isValid).toBe(true)
  })

  it('returns an invalid result for an empty debt list', () => {
    const result = calculateDebtPayoff({ debts: [], strategy: 'avalanche' })
    expect(result.isValid).toBe(false)
  })

  it('ignores debts with a zero or negative balance', () => {
    const result = calculateDebtPayoff({
      debts: [
        { id: 'a', name: 'Paid off', balance: 0, annualRate: 20, minimumPayment: 0 },
        { id: 'b', name: 'Active', balance: 1000, annualRate: 10, minimumPayment: 100 },
      ],
      strategy: 'avalanche',
      extraMonthlyPayment: 50,
    })
    expect(result.debtSummaries).toHaveLength(1)
  })

  it('handles a zero interest rate debt', () => {
    const result = calculateDebtPayoff({
      debts: [{ id: 'a', name: 'Family loan', balance: 1200, annualRate: 0, minimumPayment: 100 }],
      strategy: 'avalanche',
    })
    expect(result.payoffPossible).toBe(true)
    expect(result.monthsToPayoff).toBe(12)
  })

  it('handles a very large balance without NaN or Infinity', () => {
    const result = calculateDebtPayoff({
      debts: [{ id: 'a', name: 'Big debt', balance: 5e8, annualRate: 15, minimumPayment: 1e6 }],
      strategy: 'avalanche',
      extraMonthlyPayment: 5e5,
    })
    expect(Number.isFinite(result.totalInterest)).toBe(true)
  })
})
