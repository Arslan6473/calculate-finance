'use client'

import * as React from 'react'

import { raiseConfig } from '@/config/calculators/raise'
import { calculateRaise, type RaiseType } from '@/lib/calculators/raise'
import type { PayFrequency } from '@/lib/tax/us-federal-2026'
import { useCurrency } from '@/components/currency-provider'
import { formatCurrency } from '@/lib/formatting/currency'
import { formatPercent } from '@/lib/formatting/number'
import { CalculatorForm } from '@/components/calculators/shell/calculator-form'
import { CalculatorShell } from '@/components/calculators/shell/calculator-shell'
import { useCalculatorState } from '@/components/calculators/shell/use-calculator-state'
import { ResultStat, ResultGrid } from '@/components/calculators/result-stat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ComparisonBarChart } from '@/components/charts/comparison-bar-chart'

export function RaiseCalculator() {
  const state = useCalculatorState(raiseConfig)
  const { currency } = useCurrency()
  const v = state.values

  const result = React.useMemo(
    () =>
      calculateRaise({
        currentSalary: Number(v.currentSalary),
        raiseType: v.raiseType as RaiseType,
        raisePercent: Number(v.raisePercent),
        raiseAmount: Number(v.raiseAmount),
        payFrequency: v.payFrequency as PayFrequency,
        inflationRate: Number(v.inflationRate),
      }),
    [v.currentSalary, v.raiseType, v.raisePercent, v.raiseAmount, v.payFrequency, v.inflationRate]
  )

  const hasInflation = Number(v.inflationRate) > 0

  return (
    <CalculatorShell
      form={<CalculatorForm config={raiseConfig} state={state} />}
      sticky={{ label: 'New salary', value: formatCurrency(result.newSalary, currency) }}
      results={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Your new salary</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultStat primary label="New annual salary" value={formatCurrency(result.newSalary, currency)} />
              <div className="mt-4">
                <ResultGrid>
                  <ResultStat label="Raise per year" value={formatCurrency(result.raiseAmount, currency)} />
                  <ResultStat label="Raise percentage" value={formatPercent(result.raisePercent)} />
                  <ResultStat label="Increase per month" value={formatCurrency(result.monthlyIncrease, currency)} />
                  <ResultStat label="Increase per paycheck" value={formatCurrency(result.perPaycheckIncrease, currency)} />
                  <ResultStat label="New gross paycheck" value={formatCurrency(result.newPerPaycheck, currency)} />
                  {hasInflation && (
                    <ResultStat label="Real raise after inflation" value={formatPercent(result.realRaisePercent)} />
                  )}
                </ResultGrid>
              </div>
              <p className="mt-4 text-xs text-ink-subtle">
                {hasInflation
                  ? result.beatsInflation
                    ? `This raise outpaces ${formatPercent(Number(v.inflationRate))} inflation — your purchasing power goes up.`
                    : `This raise is below ${formatPercent(Number(v.inflationRate))} inflation — your purchasing power goes down.`
                  : 'Set an inflation rate to see whether this raise keeps up with rising prices.'}{' '}
                All figures are gross pay, before tax.
              </p>
            </CardContent>
          </Card>

          {result.isValid && (
            <Card>
              <CardContent className="pt-5">
                <ComparisonBarChart
                  title="Salary before and after the raise"
                  currency={currency}
                  bars={[
                    { label: 'Current salary', value: Number(v.currentSalary), color: 'var(--series-1)' },
                    { label: 'New salary', value: result.newSalary, color: 'var(--gain)' },
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
