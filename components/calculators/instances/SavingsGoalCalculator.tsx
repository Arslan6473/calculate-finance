'use client'

import * as React from 'react'

import { savingsGoalConfig } from '@/config/calculators/savingsGoal'
import { calculateSavingsGoal, type ContributionTiming } from '@/lib/calculators/savingsGoal'
import type { CompoundFrequency } from '@/lib/calculators/compoundInterest'
import { useCurrency } from '@/components/currency-provider'
import { formatCurrency } from '@/lib/formatting/currency'
import { CalculatorForm } from '@/components/calculators/shell/calculator-form'
import { CalculatorShell } from '@/components/calculators/shell/calculator-shell'
import { useCalculatorState } from '@/components/calculators/shell/use-calculator-state'
import { ResultStat, ResultGrid } from '@/components/calculators/result-stat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StackedGrowthChart } from '@/components/charts/stacked-growth-chart'

export function SavingsGoalCalculator() {
  const state = useCalculatorState(savingsGoalConfig)
  const { currency } = useCurrency()
  const v = state.values

  const result = React.useMemo(
    () =>
      calculateSavingsGoal({
        goalAmount: Number(v.goalAmount),
        currentSavings: Number(v.currentSavings),
        termYears: Number(v.termYears),
        annualRate: Number(v.annualRate),
        compoundFrequency: v.compoundFrequency as CompoundFrequency,
        contributionTiming: v.contributionTiming as ContributionTiming,
      }),
    [v.goalAmount, v.currentSavings, v.termYears, v.annualRate, v.compoundFrequency, v.contributionTiming]
  )

  let note: string | null = null
  if (result.goalAlreadyReached) {
    note = 'Your current savings already meet this goal — no further deposits are needed.'
  } else if (result.onTrackWithoutContributions) {
    note = `Your current savings are on track to grow to ${formatCurrency(result.currentSavingsFutureValue, currency)} by the goal date without further deposits.`
  }

  return (
    <CalculatorShell
      form={<CalculatorForm config={savingsGoalConfig} state={state} />}
      sticky={{ label: 'Save per month', value: formatCurrency(result.monthlyContribution, currency) }}
      results={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Your savings plan</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultStat
                primary
                label="Required monthly deposit"
                value={formatCurrency(result.monthlyContribution, currency)}
              />
              <div className="mt-4">
                <ResultGrid>
                  <ResultStat label="Total contributed" value={formatCurrency(result.totalContributed, currency)} />
                  <ResultStat label="Interest earned" value={formatCurrency(result.interestEarned, currency)} />
                  <ResultStat label="Balance at goal date" value={formatCurrency(result.projectedBalance, currency)} />
                  <ResultStat
                    label="Current savings grow to"
                    value={formatCurrency(result.currentSavingsFutureValue, currency)}
                  />
                </ResultGrid>
              </div>
              {note && <p className="mt-4 text-sm text-ink-muted">{note}</p>}
              <p className="mt-4 text-xs text-ink-subtle">
                Assumes a constant rate and a fixed monthly deposit. Investment returns are not guaranteed.
              </p>
            </CardContent>
          </Card>

          {result.isValid && result.yearly.length > 0 && (
            <Card>
              <CardContent className="pt-5">
                <StackedGrowthChart
                  title="Progress toward your goal"
                  xLabel="Year"
                  currency={currency}
                  data={result.yearly.map((y) => ({ x: y.year, contributed: y.totalContributed, growth: y.totalInterest }))}
                />
              </CardContent>
            </Card>
          )}
        </>
      }
    />
  )
}
