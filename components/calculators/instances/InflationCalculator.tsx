'use client'

import * as React from 'react'

import { inflationConfig } from '@/config/calculators/inflation'
import { calculateInflation, type InflationMode } from '@/lib/calculators/inflation'
import { useCurrency } from '@/components/currency-provider'
import { formatCurrency } from '@/lib/formatting/currency'
import { formatPercent } from '@/lib/formatting/number'
import { CalculatorForm } from '@/components/calculators/shell/calculator-form'
import { CalculatorShell } from '@/components/calculators/shell/calculator-shell'
import { useCalculatorState } from '@/components/calculators/shell/use-calculator-state'
import { ResultStat, ResultGrid } from '@/components/calculators/result-stat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BalanceLineChart } from '@/components/charts/balance-line-chart'

export function InflationCalculator() {
  const state = useCalculatorState(inflationConfig)
  const { currency } = useCurrency()
  const v = state.values

  const mode = (v.mode as InflationMode) === 'past' ? 'past' : 'future'

  const result = React.useMemo(
    () =>
      calculateInflation({
        amount: Number(v.amount),
        inflationRate: Number(v.inflationRate),
        termYears: Number(v.termYears),
        mode,
      }),
    [v.amount, v.inflationRate, v.termYears, mode]
  )

  const n = Number(v.termYears)
  const amount = formatCurrency(Number(v.amount), currency)
  const isFuture = mode === 'future'

  const primaryLabel = isFuture ? `Cost of the same goods in ${n} years` : `Equivalent ${n} years ago`
  const primaryValue = isFuture ? result.grownValue : result.discountedValue

  return (
    <CalculatorShell
      form={<CalculatorForm config={inflationConfig} state={state} />}
      sticky={{ label: isFuture ? 'Future cost' : `${n} years ago`, value: formatCurrency(primaryValue, currency) }}
      results={
        <>
          <Card>
            <CardHeader>
              <CardTitle>{isFuture ? 'Inflation ahead' : 'Inflation looking back'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultStat primary label={primaryLabel} value={formatCurrency(primaryValue, currency)} />
              <div className="mt-4">
                <ResultGrid>
                  {isFuture ? (
                    <ResultStat
                      label={`Buying power of ${amount} in ${n} years`}
                      value={formatCurrency(result.discountedValue, currency)}
                    />
                  ) : (
                    <ResultStat
                      label={`${amount} from ${n} years ago, in today’s dollars`}
                      value={formatCurrency(result.grownValue, currency)}
                    />
                  )}
                  <ResultStat label="Cumulative inflation" value={formatPercent(result.cumulativeInflation)} />
                  <ResultStat
                    label="Purchasing power lost"
                    value={formatPercent(result.purchasingPowerLoss)}
                    tone={result.purchasingPowerLoss > 0 ? 'loss' : 'default'}
                  />
                </ResultGrid>
              </div>
              <p className="mt-4 text-xs text-ink-subtle">
                Assumes the same inflation rate every year. For actual historical price changes, refer to the
                Consumer Price Index from the U.S. Bureau of Labor Statistics.
              </p>
            </CardContent>
          </Card>

          {result.isValid && result.yearly.length > 0 && (
            <Card>
              <CardContent className="pt-5">
                <BalanceLineChart
                  title={isFuture ? 'Prices and purchasing power over time' : 'The same amount, years back'}
                  xLabel={isFuture ? 'Years from now' : 'Years ago'}
                  currency={currency}
                  series={
                    isFuture
                      ? [
                          {
                            name: 'Cost of the same goods',
                            color: 'var(--series-1)',
                            points: result.yearly.map((y) => ({ x: y.year, y: y.grownValue })),
                          },
                          {
                            name: 'Purchasing power',
                            color: 'var(--loss)',
                            points: result.yearly.map((y) => ({ x: y.year, y: y.discountedValue })),
                          },
                        ]
                      : [
                          {
                            name: 'Equivalent amount',
                            color: 'var(--series-1)',
                            points: result.yearly.map((y) => ({ x: y.year, y: y.discountedValue })),
                          },
                        ]
                  }
                />
              </CardContent>
            </Card>
          )}
        </>
      }
    />
  )
}
