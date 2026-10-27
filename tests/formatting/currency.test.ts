import { describe, expect, it } from 'vitest'
import { CURRENCIES, CURRENCY_META, formatCurrency, isCurrencyCode } from '@/lib/formatting/currency'

describe('currencies', () => {
  it('every listed currency has metadata and formats without throwing', () => {
    for (const code of CURRENCIES) {
      expect(CURRENCY_META[code].code).toBe(code)
      expect(formatCurrency(1234567, code)).toMatch(/\d/)
      expect(formatCurrency(1234567, code, { compact: true })).toMatch(/\d/)
    }
  })

  it('formats Pakistani rupees', () => {
    expect(isCurrencyCode('PKR')).toBe(true)
    expect(formatCurrency(1250000, 'PKR')).toBe('Rs\u00a01,250,000')
    expect(formatCurrency(45231.567, 'PKR', { whole: false })).toBe('Rs\u00a045,231.57')
  })

  it('uses lakh grouping for Indian rupees', () => {
    expect(formatCurrency(1234567, 'INR')).toBe('₹12,34,567')
  })

  it('never shows decimals for yen', () => {
    expect(formatCurrency(1234.56, 'JPY', { whole: false })).toBe('¥1,235')
  })
})
