'use client'

import type { CalculatorConfig } from '@/config/calculators/types'
import { FieldControl } from './field-control'
import type { CalculatorState } from './use-calculator-state'

interface CalculatorFormProps {
  config: CalculatorConfig
  state: CalculatorState
}

/**
 * Renders every input declared in a calculator's config, grouped under the
 * subheadings the config assigns (e.g. "Loan details" vs "Escrow & fees").
 * Fields with no group render first, ungrouped.
 */
export function CalculatorForm({ config, state }: CalculatorFormProps) {
  const ungrouped = config.inputs.filter((f) => !f.group)
  const groups = new Map<string, typeof config.inputs>()
  for (const field of config.inputs) {
    if (!field.group) continue
    const existing = groups.get(field.group)
    if (existing) existing.push(field)
    else groups.set(field.group, [field])
  }

  return (
    <form className="space-y-6" aria-label={`${config.name} inputs`}>
      {ungrouped.length > 0 && (
        <div className="space-y-4">
          {ungrouped.map((field) => (
            <FieldControl
              key={field.name}
              field={field}
              rawValue={state.raw[field.name] ?? ''}
              value={state.values[field.name]}
              error={state.errors[field.name]}
              onRawChange={(v) => state.setRaw(field.name, v)}
              onValueChange={(v) => state.setValue(field.name, v)}
            />
          ))}
        </div>
      )}

      {Array.from(groups.entries()).map(([groupName, fields]) => (
        <div key={groupName} className="space-y-4">
          <h3 className="text-sm font-semibold text-ink-muted">{groupName}</h3>
          {fields.map((field) => (
            <FieldControl
              key={field.name}
              field={field}
              rawValue={state.raw[field.name] ?? ''}
              value={state.values[field.name]}
              error={state.errors[field.name]}
              onRawChange={(v) => state.setRaw(field.name, v)}
              onValueChange={(v) => state.setValue(field.name, v)}
            />
          ))}
        </div>
      ))}
    </form>
  )
}
