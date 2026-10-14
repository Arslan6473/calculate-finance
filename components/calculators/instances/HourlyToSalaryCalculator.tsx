'use client'

import * as React from 'react'
import Link from 'next/link'

import { hourlyToSalaryConfig } from '@/config/calculators/hourlyToSalary'
import { calculateHourlyToSalary, type HourlyToSalaryDirection } from '@/lib/calculators/hourlyToSalary'
import { useCurrency } from '@/components/currency-provider'
import { formatCurrency } from '@/lib/formatting/currency'
import { formatNumber } from '@/lib/formatting/number'
import { CalculatorForm } from '@/components/calculators/shell/calculator-form'
import { CalculatorShell } from '@/components/calculators/shell/calculator-shell'
import { useCalculatorState } from '@/components/calculators/shell/use-calculator-state'
import { ResultStat, ResultGrid } from '@/components/calculators/result-stat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function HourlyToSalaryCalculator() {
  const state = useCalculatorState(hourlyToSalaryConfig)
  const { currency } = useCurrency()
  const v = state.values

  const result = React.useMemo(
    () =>
      calculateHourlyToSalary({
        direction: v.direction as HourlyToSalaryDirection,
        hourlyRate: Number(v.hourlyRate),
        annualSalary: Number(v.annualSalary),
        hoursPerWeek: Number(v.hoursPerWeek),
        daysPerWeek: Number(v.daysPerWeek),
        unpaidWeeksOff: Number(v.unpaidWeeksOff),
      }),
    [v.direction, v.hourlyRate, v.annualSalary, v.hoursPerWeek, v.daysPerWeek, v.unpaidWeeksOff]
  )

  // The headline is whichever figure the user did not enter.
  const knowsHourly = v.direction !== 'annual'
  const primary = knowsHourly
    ? { label: 'Annual salary', value: formatCurrency(result.annual, currency) }
    : { label: 'Hourly rate', value: formatCurrency(result.hourly, currency) }

  return (
    <CalculatorShell
      form={<CalculatorForm config={hourlyToSalaryConfig} state={state} />}
      sticky={primary}
      results={
        <Card>
          <CardHeader>
            <CardTitle>Your gross pay</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultStat primary label={primary.label} value={primary.value} />
            <div className="mt-4">
              <ResultGrid>
                {knowsHourly ? (
                  <ResultStat label="Hourly" value={formatCurrency(result.hourly, currency)} />
                ) : (
                  <ResultStat label="Annual" value={formatCurrency(result.annual, currency)} />
                )}
                <ResultStat label="Monthly (average)" value={formatCurrency(result.monthly, currency)} />
                <ResultStat label="Biweekly" value={formatCurrency(result.biweekly, currency)} />
                <ResultStat label="Weekly" value={formatCurrency(result.weekly, currency)} />
                <ResultStat label="Daily" value={formatCurrency(result.daily, currency)} />
                <ResultStat label="Paid hours per year" value={formatNumber(result.hoursPerYear, 1)} />
              </ResultGrid>
            </div>
            <p className="mt-4 text-xs text-ink-subtle">
              Gross pay before tax, based on {formatNumber(result.paidWeeks)} paid weeks a year. Weekly,
              biweekly, and daily figures are for periods you work. For take-home pay, use the{' '}
              <Link href="/calculators/salary-calculator" className="underline underline-offset-2">
                salary calculator
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      }
    />
  )
}
