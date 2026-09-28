'use client'

import * as React from 'react'
import { Download } from 'lucide-react'

import type { AmortizationRow } from '@/lib/calculators/amortization'
import { toYearlySchedule } from '@/lib/calculators/amortization'
import { useCurrency } from '@/components/currency-provider'
import { formatAmount } from '@/lib/formatting/currency'
import { downloadCsv } from '@/lib/csv'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface AmortizationTableProps {
  rows: AmortizationRow[]
  filename: string
}

/**
 * The amortization schedule required by brief §6: monthly/yearly toggle,
 * a horizontally-scrolling table on narrow screens (§24 — never overflow the
 * page), and a CSV export of the currently selected granularity.
 */
export function AmortizationTable({ rows, filename }: AmortizationTableProps) {
  const [view, setView] = React.useState<'monthly' | 'yearly'>('yearly')
  const { currency } = useCurrency()

  const yearly = React.useMemo(() => toYearlySchedule(rows), [rows])

  if (rows.length === 0) return null

  function handleDownload() {
    if (view === 'yearly') {
      downloadCsv(
        filename,
        ['Year', 'Payment', 'Principal', 'Interest', 'Remaining balance'],
        yearly.map((r) => [r.year, r.payment, r.principal, r.interest, r.balance])
      )
    } else {
      downloadCsv(
        filename,
        ['Payment #', 'Payment', 'Principal', 'Interest', 'Remaining balance'],
        rows.map((r) => [r.period, r.payment, r.principal, r.interest, r.balance])
      )
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <Tabs value={view} onValueChange={(v) => setView(v as 'monthly' | 'yearly')}>
          <TabsList>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download />
          Download CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-card border border-line">
        <table className="figures w-full min-w-[32rem] text-sm">
          <thead className="border-b border-line bg-surface-muted text-left text-xs text-ink-muted">
            <tr>
              <th className="px-3 py-2 font-medium">{view === 'yearly' ? 'Year' : 'Payment #'}</th>
              <th className="px-3 py-2 font-medium">Payment</th>
              <th className="px-3 py-2 font-medium">Principal</th>
              <th className="px-3 py-2 font-medium">Interest</th>
              <th className="px-3 py-2 font-medium">Remaining balance</th>
            </tr>
          </thead>
          <tbody>
            {(view === 'yearly' ? yearly : rows).map((row) => (
              <tr
                key={view === 'yearly' ? (row as { year: number }).year : (row as AmortizationRow).period}
                className="border-b border-line last:border-b-0"
              >
                <td className="px-3 py-2 text-ink-muted">
                  {view === 'yearly' ? (row as { year: number }).year : (row as AmortizationRow).period}
                </td>
                <td className="px-3 py-2">{formatAmount(row.payment, currency)}</td>
                <td className="px-3 py-2">{formatAmount(row.principal, currency)}</td>
                <td className="px-3 py-2">{formatAmount(row.interest, currency)}</td>
                <td className="px-3 py-2">{formatAmount(row.balance, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
