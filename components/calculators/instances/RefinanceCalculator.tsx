'use client'

import * as React from 'react'

import { refinanceConfig } from '@/config/calculators/refinance'
import { calculateRefinance } from '@/lib/calculators/refinance'
import { useCurrency } from '@/components/currency-provider'
import { formatCurrency } from '@/lib/formatting/currency'
import { formatMonths } from '@/lib/formatting/number'
import { CalculatorForm } from '@/components/calculators/shell/calculator-form'
import { CalculatorShell } from '@/components/calculators/shell/calculator-shell'
import { useCalculatorState } from '@/components/calculators/shell/use-calculator-state'
import { ResultStat, ResultGrid } from '@/components/calculators/result-stat'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ComparisonBarChart } from '@/components/charts/comparison-bar-chart'

export function RefinanceCalculator() {
  const state = useCalculatorState(refinanceConfig)
  const { currency } = useCurrency()
  const v = state.values

  const result = React.useMemo(
    () =>
      calculateRefinance({
        currentBalance: Number(v.currentBalance),
        currentRate: Number(v.currentRate),
        remainingYears: Number(v.remainingYears),
        newRate: Number(v.newRate),
        newTermYears: Number(v.newTermYears),
        closingCosts: Number(v.closingCosts),
        rollCostsIntoLoan: Boolean(v.rollCostsIntoLoan),
      }),
    [
      v.currentBalance,
      v.currentRate,
      v.remainingYears,
      v.newRate,
      v.newTermYears,
      v.closingCosts,
      v.rollCostsIntoLoan,
    ]
  )

  const savesOverall = result.lifetimeNetSavings > 0
  const breakEvenLabel =
    result.breakEvenMonths === null
      ? 'Never'
      : result.breakEvenMonths === 0
        ? 'Immediately'
        : `${result.breakEvenMonths} ${result.breakEvenMonths === 1 ? 'month' : 'months'}`

  return (
    <CalculatorShell
      form={<CalculatorForm config={refinanceConfig} state={state} />}
      sticky={{ label: 'Monthly savings', value: formatCurrency(result.monthlySavings, currency) }}
      results={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Refinance at a glance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between gap-3">
                <ResultStat
                  primary
                  label="Monthly savings"
                  value={formatCurrency(result.monthlySavings, currency)}
                  tone={result.monthlySavings < 0 ? 'loss' : 'default'}
                />
                {result.isValid && (
                  <Badge variant={savesOverall ? 'gain' : 'loss'}>
                    {savesOverall ? 'Saves money overall' : 'Costs more overall'}
                  </Badge>
                )}
              </div>
              <div className="mt-4">
                <ResultGrid>
                  <ResultStat
                    label="Current payment"
                    value={formatCurrency(result.currentMonthlyPayment, currency)}
                  />
                  <ResultStat
                    label="New payment"
                    value={formatCurrency(result.newMonthlyPayment, currency)}
                  />
                  <ResultStat label="Break-even" value={breakEvenLabel} hint="Closing costs ÷ monthly savings" />
                  <ResultStat
                    label="Lifetime net savings"
                    value={formatCurrency(result.lifetimeNetSavings, currency)}
                    tone={savesOverall ? 'gain' : 'loss'}
                    hint="After closing costs"
                  />
                  <ResultStat
                    label="Interest left on current loan"
                    value={formatCurrency(result.currentTotalInterest, currency)}
                  />
                  <ResultStat
                    label="Interest on new loan"
                    value={formatCurrency(result.newTotalInterest, currency)}
                  />
                </ResultGrid>
              </div>
              {result.isValid && result.monthlySavings > 0 && !savesOverall && (
                <p className="mt-4 text-sm text-ink-muted">
                  {result.termExtensionMonths > 0
                    ? `The payment drops, but the new loan runs ${formatMonths(result.termExtensionMonths)} longer than your current one, and the extra interest outweighs the lower rate.`
                    : 'The payment drops, but closing costs and interest on the new loan outweigh the lower rate over its life.'}
                </p>
              )}
              {result.isValid && result.breakEvenMonths === null && (
                <p className="mt-4 text-sm text-ink-muted">
                  The new payment is not lower, so closing costs are never recovered month by month.
                  Any saving comes from paying the loan off sooner.
                </p>
              )}
            </CardContent>
          </Card>

          {result.isValid && (
            <Card>
              <CardContent className="pt-5">
                <ComparisonBarChart
                  title="Total cost from today"
                  currency={currency}
                  bars={[
                    { label: 'Keep current loan', value: result.currentTotalPaid, color: 'var(--series-1)' },
                    { label: 'Refinance', value: result.newTotalCost, color: 'var(--series-2)' },
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
