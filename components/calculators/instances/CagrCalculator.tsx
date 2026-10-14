'use client'

import * as React from 'react'

import { cagrConfig } from '@/config/calculators/cagr'
import { calculateCagrDetails } from '@/lib/calculators/cagr'
import { useCurrency } from '@/components/currency-provider'
import { formatCurrency } from '@/lib/formatting/currency'
import { formatPercent } from '@/lib/formatting/number'
import { CalculatorForm } from '@/components/calculators/shell/calculator-form'
import { CalculatorShell } from '@/components/calculators/shell/calculator-shell'
import { useCalculatorState } from '@/components/calculators/shell/use-calculator-state'
import { ResultStat, ResultGrid } from '@/components/calculators/result-stat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BalanceLineChart } from '@/components/charts/balance-line-chart'

export function CagrCalculator() {
  const state = useCalculatorState(cagrConfig)
  const { currency } = useCurrency()
  const v = state.values

  const result = React.useMemo(
    () =>
      calculateCagrDetails({
        beginValue: Number(v.beginValue),
        endValue: Number(v.endValue),
        periodYears: Number(v.periodYears),
      }),
    [v.beginValue, v.endValue, v.periodYears]
  )

  const tone = result.isValid ? (result.isGain ? 'gain' : 'loss') : 'default'

  return (
    <CalculatorShell
      form={<CalculatorForm config={cagrConfig} state={state} />}
      sticky={{ label: 'CAGR', value: formatPercent(result.cagr) }}
      results={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Your growth rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultStat primary label="Compound annual growth rate" value={formatPercent(result.cagr)} tone={tone} />
              <div className="mt-4">
                <ResultGrid>
                  <ResultStat label="Total return" value={formatPercent(result.totalReturn)} tone={tone} />
                  <ResultStat label="Absolute gain or loss" value={formatCurrency(result.absoluteGain, currency)} tone={tone} />
                  <ResultStat label="Growth multiple" value={`${result.multiple.toFixed(2)}×`} />
                </ResultGrid>
              </div>
              {!result.isValid && (
                <p className="mt-4 text-sm text-ink-muted">
                  CAGR needs a beginning value above zero, an ending value of zero or more, and a period longer than
                  zero years.
                </p>
              )}
            </CardContent>
          </Card>

          {result.isValid && result.path.length > 1 && (
            <Card>
              <CardContent className="pt-5">
                <BalanceLineChart
                  title="Smoothed growth path at a constant rate"
                  xLabel="Year"
                  currency={currency}
                  series={[
                    {
                      name: 'Value at CAGR',
                      color: result.isGain ? 'var(--gain)' : 'var(--loss)',
                      points: result.path.map((p) => ({ x: p.year, y: p.value })),
                    },
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
