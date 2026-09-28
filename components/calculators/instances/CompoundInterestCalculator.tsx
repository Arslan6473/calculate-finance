'use client'

import * as React from 'react'

import { compoundInterestConfig } from '@/config/calculators/compoundInterest'
import { calculateCompoundInterest, type CompoundFrequency, type ContributionFrequency } from '@/lib/calculators/compoundInterest'
import { useCurrency } from '@/components/currency-provider'
import { formatCurrency } from '@/lib/formatting/currency'
import { formatPercent } from '@/lib/formatting/number'
import { CalculatorForm } from '@/components/calculators/shell/calculator-form'
import { CalculatorShell } from '@/components/calculators/shell/calculator-shell'
import { useCalculatorState } from '@/components/calculators/shell/use-calculator-state'
import { ResultStat, ResultGrid } from '@/components/calculators/result-stat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StackedGrowthChart } from '@/components/charts/stacked-growth-chart'

export function CompoundInterestCalculator() {
  const state = useCalculatorState(compoundInterestConfig)
  const { currency } = useCurrency()
  const v = state.values

  const result = React.useMemo(
    () =>
      calculateCompoundInterest({
        principal: Number(v.principal),
        annualRate: Number(v.annualRate),
        termYears: Number(v.termYears),
        compoundFrequency: v.compoundFrequency as CompoundFrequency,
        contribution: Number(v.contribution),
        contributionFrequency: v.contributionFrequency as ContributionFrequency,
      }),
    [v.principal, v.annualRate, v.termYears, v.compoundFrequency, v.contribution, v.contributionFrequency]
  )

  return (
    <CalculatorShell
      form={<CalculatorForm config={compoundInterestConfig} state={state} />}
      sticky={{ label: 'Final balance', value: formatCurrency(result.finalBalance, currency) }}
      results={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Your projected balance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultStat primary label="Final balance" value={formatCurrency(result.finalBalance, currency)} />
              <div className="mt-4">
                <ResultGrid>
                  <ResultStat label="Total contributed" value={formatCurrency(result.totalContributed, currency)} />
                  <ResultStat label="Total interest earned" value={formatCurrency(result.totalInterest, currency)} />
                  <ResultStat label="Interest share of balance" value={formatPercent(result.interestShare)} />
                  <ResultStat label="Effective annual rate" value={formatPercent(result.effectiveAnnualRate)} />
                </ResultGrid>
              </div>
            </CardContent>
          </Card>

          {result.isValid && result.yearly.length > 0 && (
            <Card>
              <CardContent className="pt-5">
                <StackedGrowthChart
                  title="Growth over time"
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
