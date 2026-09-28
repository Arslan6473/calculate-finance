'use client'

import * as React from 'react'
import { HelpCircle } from 'lucide-react'

import type { InputField } from '@/config/calculators/types'
import { useCurrency } from '@/components/currency-provider'
import { currencySymbol } from '@/lib/formatting/currency'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { FieldValue } from './use-calculator-state'

interface FieldControlProps {
  field: InputField
  rawValue: string
  value: FieldValue
  error?: string
  onRawChange: (value: string) => void
  onValueChange: (value: FieldValue) => void
}

/**
 * Renders one input from a calculator's config. This is the component that
 * makes the declarative-inputs half of the architecture pay off: numeric
 * keyboards, labels, help text, and error wiring are implemented once here and
 * are correct for every calculator that uses this control.
 */
export function FieldControl({
  field,
  rawValue,
  value,
  error,
  onRawChange,
  onValueChange,
}: FieldControlProps) {
  const { currency } = useCurrency()
  const inputId = `field-${field.name}`
  const errorId = `${inputId}-error`
  const helpId = `${inputId}-help`
  const describedBy = [error ? errorId : null, field.help ? helpId : null].filter(Boolean).join(' ')

  if (field.type === 'toggle') {
    return (
      <div className="flex items-center justify-between gap-4 py-1">
        <div className="flex items-center gap-1.5">
          <Label htmlFor={inputId}>{field.label}</Label>
          {field.help && <FieldHelp text={field.help} />}
        </div>
        <Switch
          id={inputId}
          checked={Boolean(value)}
          onCheckedChange={(checked) => onValueChange(checked)}
        />
      </div>
    )
  }

  if (field.type === 'select') {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Label htmlFor={inputId}>{field.label}</Label>
          {field.help && <FieldHelp text={field.help} />}
        </div>
        <Select
          value={String(value)}
          onValueChange={(next) => {
            const option = field.options.find((o) => String(o.value) === next)
            if (option) onValueChange(option.value)
          }}
        >
          <SelectTrigger id={inputId}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={String(option.value)} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  const unit = field.type === 'currency' ? currencySymbol(currency) : field.type === 'percent' ? '%' : field.unit

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={inputId}>{field.label}</Label>
        {field.help && <FieldHelp text={field.help} />}
      </div>
      <div className="relative">
        {unit && field.type === 'currency' && (
          <span className="figures pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-ink-subtle">
            {unit}
          </span>
        )}
        <Input
          id={inputId}
          type="text"
          inputMode="decimal"
          value={rawValue}
          onChange={(e) => onRawChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          className={unit && field.type === 'currency' ? 'pl-7' : unit ? 'pr-12' : undefined}
        />
        {unit && field.type !== 'currency' && (
          <span className="figures pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-ink-subtle">
            {unit}
          </span>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-xs text-loss">
          {error}
        </p>
      )}
      {field.help && (
        <span id={helpId} className="sr-only">
          {field.help}
        </span>
      )}
    </div>
  )
}

function FieldHelp({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger aria-label="More information" className="text-ink-subtle hover:text-ink-muted">
        <HelpCircle className="size-3.5" />
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  )
}
