import { describe, expect, it } from 'vitest'
import { validateNumericField } from '@/lib/calculators/parse-field'
import type { NumericField } from '@/config/calculators/types'

const field: NumericField = {
  name: 'amount',
  label: 'Amount',
  type: 'currency',
  defaultValue: 1000,
  min: 0,
  max: 100_000,
}

describe('validateNumericField', () => {
  it('accepts a plain number', () => {
    const result = validateNumericField(field, '5000')
    expect(result).toEqual({ ok: true, value: 5000 })
  })

  it('treats an empty string as a valid zero, not an error', () => {
    const result = validateNumericField(field, '')
    expect(result).toEqual({ ok: true, value: 0 })
  })

  it('tolerates grouping separators and currency symbols', () => {
    expect(validateNumericField(field, '$1,234').value).toBe(1234)
  })

  it('rejects unparsable text', () => {
    const result = validateNumericField(field, 'abc')
    expect(result.ok).toBe(false)
    expect(result.message).toMatch(/valid number/i)
  })

  it('rejects a value below the minimum', () => {
    const result = validateNumericField(field, '-50')
    expect(result.ok).toBe(false)
    expect(result.message).toMatch(/at least/i)
  })

  it('rejects a value above the maximum', () => {
    const result = validateNumericField(field, '999999')
    expect(result.ok).toBe(false)
    expect(result.message).toMatch(/at most/i)
  })

  it('has no error for a field with no min/max bounds', () => {
    const unbounded: NumericField = { name: 'x', label: 'X', type: 'number', defaultValue: 0 }
    expect(validateNumericField(unbounded, '-999999999').ok).toBe(true)
  })
})
