'use client'

import { useCurrency } from '@/components/currency-provider'
import { CURRENCY_META, CURRENCIES } from '@/lib/formatting/currency'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency()

  return (
    <Select value={currency} onValueChange={(value) => setCurrency(value as typeof currency)}>
      <SelectTrigger aria-label="Currency" className="h-9 w-[5.5rem] gap-1 px-2 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {CURRENCIES.map((code) => (
          <SelectItem key={code} value={code}>
            {code} {CURRENCY_META[code].symbol}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
