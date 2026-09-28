'use client'

import * as React from 'react'

import { investmentConfig } from '@/config/calculators/investment'
import { calculateInvestment } from '@/lib/calculators/investment'
import { useCurrency } from '@/components/currency-provider'
import { formatCurrency } from '@/lib/formatting/currency'
import { formatPercent } from '@/lib/formatting/number'
import { CalculatorForm } from '@/components/calculators/shell/calculator-form'
import { CalculatorShell } from '@/components/calculators/shell/calculator-shell'
import { useCalculatorState } from '@/components/calculators/shell/use-calculator-state'
import { ResultStat, ResultGrid } from '@/components/calculators/result-stat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StackedGrowthChart } from '@/components/charts/stacked-growth-chart'

export function InvestmentCalculator() {
  const state = useCalculatorState(investmentConfig)
  const { currency } = useCurrency()
  const v = state.values

  const result = React.useMemo(
    () =>
      calculateInvestment({
        initialInvestment: Number(v.initialInvestment),
        monthlyContribution: Number(v.monthlyContribution),
        annualReturn: Number(v.annualReturn),
        termYears: Number(v.termYears),
        annualFeePercent: Number(v.annualFeePercent),
        annualContributionIncrease: Number(v.annualContributionIncrease),
        inflationRate: Number(v.inflationRate),
      }),
    [
      v.initialInvestment,
      v.monthlyContribution,
      v.annualReturn,
      v.termYears,
      v.annualFeePercent,
      v.annualContributionIncrease,
      v.inflationRate,
    ]
  )

  return (
    <CalculatorShell
      form={<CalculatorForm config={investmentConfig} state={state} />}
      sticky={{ label: 'Final balance', value: formatCurrency(result.finalBalance, currency) }}
      results={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Your projected portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultStat primary label="Final balance" value={formatCurrency(result.finalBalance, currency)} />
              <div className="mt-4">
                <ResultGrid>
                  <ResultStat label="Total contributed" value={formatCurrency(result.totalContributed, currency)} />
                  <ResultStat label="Total growth" value={formatCurrency(result.totalGrowth, currency)} />
                  <ResultStat label="In today's dollars" value={formatCurrency(result.realFinalBalance, currency)} />
                  <ResultStat label="Total fees paid" value={formatCurrency(result.totalFees, currency)} />
                </ResultGrid>
              </div>
              <p className="mt-4 text-sm text-ink-muted">
                Effective annual return after fees: {formatPercent(result.netAnnualReturn)}.
              </p>
            </CardContent>
          </Card>

          {result.isValid && result.yearly.length > 0 && (
            <Card>
              <CardContent className="pt-5">
                <StackedGrowthChart
                  title="Portfolio growth over time"
                  xLabel="Year"
                  currency={currency}
                  data={result.yearly.map((y) => ({ x: y.year, contributed: y.totalContributed, growth: y.totalGrowth }))}
                />
              </CardContent>
            </Card>
          )}
        </>
      }
    />
  )
}
