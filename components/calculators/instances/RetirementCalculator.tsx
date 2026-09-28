'use client'

import * as React from 'react'

import { retirementConfig } from '@/config/calculators/retirement'
import { calculateRetirement } from '@/lib/calculators/retirement'
import { useCurrency } from '@/components/currency-provider'
import { formatCurrency } from '@/lib/formatting/currency'
import { CalculatorForm } from '@/components/calculators/shell/calculator-form'
import { CalculatorShell } from '@/components/calculators/shell/calculator-shell'
import { useCalculatorState } from '@/components/calculators/shell/use-calculator-state'
import { ResultStat, ResultGrid } from '@/components/calculators/result-stat'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StackedGrowthChart } from '@/components/charts/stacked-growth-chart'
import { BalanceLineChart } from '@/components/charts/balance-line-chart'

export function RetirementCalculator() {
  const state = useCalculatorState(retirementConfig)
  const { currency } = useCurrency()
  const v = state.values

  const result = React.useMemo(
    () =>
      calculateRetirement({
        currentAge: Number(v.currentAge),
        retirementAge: Number(v.retirementAge),
        currentSavings: Number(v.currentSavings),
        monthlyContribution: Number(v.monthlyContribution),
        employerMatchPercent: Number(v.employerMatchPercent),
        preRetirementReturn: Number(v.preRetirementReturn),
        postRetirementReturn: Number(v.postRetirementReturn),
        annualInflation: Number(v.annualInflation),
        desiredAnnualIncome: Number(v.desiredAnnualIncome),
        lifeExpectancy: Number(v.lifeExpectancy),
      }),
    [
      v.currentAge,
      v.retirementAge,
      v.currentSavings,
      v.monthlyContribution,
      v.employerMatchPercent,
      v.preRetirementReturn,
      v.postRetirementReturn,
      v.annualInflation,
      v.desiredAnnualIncome,
      v.lifeExpectancy,
    ]
  )

  const accumulation = result.yearly.filter((y) => !y.isRetired)
  const drawdown = result.yearly.filter((y) => y.isRetired)

  return (
    <CalculatorShell
      form={<CalculatorForm config={retirementConfig} state={state} />}
      sticky={{ label: 'At retirement', value: formatCurrency(result.balanceAtRetirement, currency) }}
      results={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Your retirement outlook</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between gap-3">
                <ResultStat primary label="Balance at retirement" value={formatCurrency(result.balanceAtRetirement, currency)} />
                {result.isValid && (
                  <Badge variant={result.onTrack ? 'gain' : 'loss'}>
                    {result.onTrack ? 'On track' : 'Behind target'}
                  </Badge>
                )}
              </div>
              <div className="mt-4">
                <ResultGrid>
                  <ResultStat label="Total contributed" value={formatCurrency(result.totalContributed, currency)} />
                  <ResultStat label="Employer match" value={formatCurrency(result.totalEmployerMatch, currency)} />
                  <ResultStat label="Target portfolio" value={formatCurrency(result.targetPortfolio, currency)} />
                  <ResultStat
                    label={result.surplusOrShortfall >= 0 ? 'Surplus' : 'Shortfall'}
                    value={formatCurrency(Math.abs(result.surplusOrShortfall), currency)}
                    tone={result.surplusOrShortfall >= 0 ? 'gain' : 'loss'}
                  />
                </ResultGrid>
              </div>
              {result.moneyRunsOutAtAge !== null ? (
                <p className="mt-4 text-sm text-loss">
                  At this rate, your savings are projected to run out at age {result.moneyRunsOutAtAge}.
                </p>
              ) : result.isValid ? (
                <p className="mt-4 text-sm text-ink-muted">
                  Your savings are projected to last through your planned life expectancy. A
                  sustainable annual income at retirement is about{' '}
                  {formatCurrency(result.sustainableAnnualIncome, currency)}.
                </p>
              ) : null}
            </CardContent>
          </Card>

          {accumulation.length > 0 && (
            <Card>
              <CardContent className="pt-5">
                <StackedGrowthChart
                  title="Savings growth before retirement"
                  xLabel="Age"
                  currency={currency}
                  data={accumulation.map((y) => ({ x: y.age, contributed: y.totalContributed, growth: y.totalGrowth }))}
                />
              </CardContent>
            </Card>
          )}

          {drawdown.length > 0 && (
            <Card>
              <CardContent className="pt-5">
                <BalanceLineChart
                  title="Portfolio balance during retirement"
                  xLabel="Age"
                  currency={currency}
                  series={[
                    { name: 'Balance', color: 'var(--series-1)', points: drawdown.map((y) => ({ x: y.age, y: y.balance })) },
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
