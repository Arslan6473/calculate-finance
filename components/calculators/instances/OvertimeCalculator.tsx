'use client'

import * as React from 'react'

import { overtimeConfig } from '@/config/calculators/overtime'
import { calculateOvertime } from '@/lib/calculators/overtime'
import { useCurrency } from '@/components/currency-provider'
import { formatCurrency } from '@/lib/formatting/currency'
import { formatPercent } from '@/lib/formatting/number'
import { CalculatorForm } from '@/components/calculators/shell/calculator-form'
import { CalculatorShell } from '@/components/calculators/shell/calculator-shell'
import { useCalculatorState } from '@/components/calculators/shell/use-calculator-state'
import { ResultStat, ResultGrid } from '@/components/calculators/result-stat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DonutSplitChart } from '@/components/charts/donut-split-chart'

export function OvertimeCalculator() {
  const state = useCalculatorState(overtimeConfig)
  const { currency } = useCurrency()
  const v = state.values

  const result = React.useMemo(
    () =>
      calculateOvertime({
        hourlyRate: Number(v.hourlyRate),
        regularHours: Number(v.regularHours),
        overtimeHours: Number(v.overtimeHours),
        multiplier: Number(v.multiplier),
        weeksPerYear: Number(v.weeksPerYear),
      }),
    [v.hourlyRate, v.regularHours, v.overtimeHours, v.multiplier, v.weeksPerYear]
  )

  return (
    <CalculatorShell
      form={<CalculatorForm config={overtimeConfig} state={state} />}
      sticky={{ label: 'Total weekly pay', value: formatCurrency(result.totalWeekly, currency) }}
      results={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Your pay with overtime</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultStat primary label="Total weekly pay" value={formatCurrency(result.totalWeekly, currency)} />
              <div className="mt-4">
                <ResultGrid>
                  <ResultStat label="Regular pay" value={formatCurrency(result.regularPay, currency)} />
                  <ResultStat label="Overtime rate" value={`${formatCurrency(result.overtimeRate, currency)}/hr`} />
                  <ResultStat label="Overtime pay" value={formatCurrency(result.overtimePay, currency)} />
                  <ResultStat label="Effective hourly rate" value={`${formatCurrency(result.effectiveHourlyRate, currency)}/hr`} />
                </ResultGrid>
              </div>
              <div className="mt-4">
                <ResultGrid>
                  <ResultStat label="Annual total" value={formatCurrency(result.annualTotal, currency)} />
                  <ResultStat label="Annual overtime pay" value={formatCurrency(result.annualOvertimePay, currency)} />
                </ResultGrid>
              </div>
              <p className="mt-4 text-xs text-ink-subtle">
                Overtime makes up {formatPercent(result.overtimeShare)} of your pay. Under the federal FLSA,
                non-exempt employees earn at least 1.5× their regular rate for hours over 40 in a workweek;
                some states add stricter rules. Gross pay before tax — general information, not legal advice.
              </p>
            </CardContent>
          </Card>

          {result.isValid && (
            <Card>
              <CardContent className="pt-5">
                <DonutSplitChart
                  title="Annual pay breakdown"
                  currency={currency}
                  slices={[
                    { label: 'Regular pay', value: result.annualRegularPay, color: 'var(--series-1)' },
                    { label: 'Overtime pay', value: result.annualOvertimePay, color: 'var(--series-2)' },
                  ]}
                />
              </CardContent>
            </Card>
          )}
        </>
      }
    />
  )
}
