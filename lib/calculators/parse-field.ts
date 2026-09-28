import type { NumericField } from '@/config/calculators/types'

export interface FieldValidation {
  ok: boolean
  value?: number
  message?: string
}

/**
 * Parses raw form text into a number, distinguishing "empty" (a deliberate,
 * valid clear that resolves to 0) from "unparsable" (a real error). Tolerates
 * grouping separators and currency symbols so pasted values still work.
 */
function parseFieldNumber(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') return 0
  const cleaned = trimmed.replace(/[,\s$€£]/g, '')
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

/**
 * Validates one numeric field's raw text against its declared range.
 *
 * Out-of-range or unparsable input is reported as an error but does NOT return
 * a value — callers keep the last valid value for computation (design spec §6:
 * "results keep showing the last valid computation rather than blanking out"),
 * while the raw text still reflects exactly what the user typed so they can
 * keep editing.
 */
export function validateNumericField(field: NumericField, raw: string): FieldValidation {
  const parsed = parseFieldNumber(raw)

  if (parsed === null) {
    return { ok: false, message: 'Enter a valid number.' }
  }
  if (field.min !== undefined && parsed < field.min) {
    return { ok: false, message: `Must be at least ${field.min.toLocaleString()}.` }
  }
  if (field.max !== undefined && parsed > field.max) {
    return { ok: false, message: `Must be at most ${field.max.toLocaleString()}.` }
  }
  return { ok: true, value: parsed }
}
