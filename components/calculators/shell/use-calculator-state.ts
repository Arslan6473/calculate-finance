'use client'

import * as React from 'react'

import type { CalculatorConfig, InputField } from '@/config/calculators/types'
import { validateNumericField } from '@/lib/calculators/parse-field'

export type FieldValue = number | string | boolean

function buildInitialState(config: CalculatorConfig) {
  const values: Record<string, FieldValue> = {}
  const raw: Record<string, string> = {}

  for (const field of config.inputs) {
    values[field.name] = field.defaultValue
    if (field.type !== 'select' && field.type !== 'toggle') {
      raw[field.name] = String(field.defaultValue)
    }
  }

  return { values, raw }
}

export interface CalculatorState {
  /** Last valid value per field — what the engine should compute against. */
  values: Record<string, FieldValue>
  /** Exact text currently in each numeric field, including invalid entries mid-edit. */
  raw: Record<string, string>
  errors: Record<string, string>
  /** Updates a numeric field from its raw text input. */
  setRaw: (name: string, rawInput: string) => void
  /** Sets a select or toggle field directly. */
  setValue: (name: string, value: FieldValue) => void
  reset: () => void
}

/**
 * Drives the auto-generated calculator form (design spec §3.2). Numeric fields
 * keep two parallel pieces of state: `raw` (exactly what the user typed, so
 * mid-edit text like "1," or "" round-trips without being fought by the
 * control) and `values` (the last input that validated, which is what feeds
 * the calculation engine). An out-of-range or unparsable entry updates `raw`
 * and `errors` but leaves `values` untouched, so results never blank out.
 */
export function useCalculatorState(config: CalculatorConfig): CalculatorState {
  const initial = React.useMemo(() => buildInitialState(config), [config])
  const [values, setValues] = React.useState(initial.values)
  const [raw, setRawState] = React.useState(initial.raw)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const fieldsByName = React.useMemo(
    () => new Map<string, InputField>(config.inputs.map((f) => [f.name, f])),
    [config]
  )

  const setRaw = React.useCallback(
    (name: string, rawInput: string) => {
      setRawState((prev) => ({ ...prev, [name]: rawInput }))

      const field = fieldsByName.get(name)
      if (!field || field.type === 'select' || field.type === 'toggle') return

      const result = validateNumericField(field, rawInput)
      if (result.ok) {
        setValues((prev) => ({ ...prev, [name]: result.value! }))
        setErrors((prev) => {
          if (!(name in prev)) return prev
          const next = { ...prev }
          delete next[name]
          return next
        })
      } else {
        setErrors((prev) => ({ ...prev, [name]: result.message! }))
      }
    },
    [fieldsByName]
  )

  const setValue = React.useCallback((name: string, value: FieldValue) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    if (typeof value !== 'boolean') {
      setRawState((prev) => ({ ...prev, [name]: String(value) }))
    }
  }, [])

  const reset = React.useCallback(() => {
    setValues(initial.values)
    setRawState(initial.raw)
    setErrors({})
  }, [initial])

  return { values, raw, errors, setRaw, setValue, reset }
}
