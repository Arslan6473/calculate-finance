'use client'

import * as React from 'react'

import { roiConfig } from '@/config/calculators/roi'
import { calculateRoi } from '@/lib/calculators/roi'
import { useCurrency } from '@/components/currency-provider'
import { formatCurrency } from '@/lib/formatting/currency'
import { formatMonths, formatPercent } from '@/lib/formatting/number'
import { CalculatorForm } from '@/components/calculators/shell/calculator-form'
import { CalculatorShell } from '@/components/calculators/shell/calculator-shell'
import { useCalculatorState } from '@/components/calculators/shell/use-calculator-state'
import { ResultStat, ResultGrid } from '@/components/calculators/result-stat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DonutSplitChart } from '@/components/charts/donut-split-chart'

export function RoiCalculator() {
  const state = useCalculatorState(roiConfig)
  const { currency } = useCurrency()
  const v = state.values

  const result = React.useMemo(
    () =>
      calculateRoi({
        initialInvestment: Number(v.initialInvestment),
        finalValue: Number(v.finalValue),
        additionalCosts: Number(v.additionalCosts),
        incomeReceived: Number(v.incomeReceived),
        holdingPeriodMonths: Number(v.holdingPeriodMonths),
      }),
    [v.initialInvestment, v.finalValue, v.additionalCosts, v.incomeReceived, v.holdingPeriodMonths]
  )

  return (
    <CalculatorShell
      form={<CalculatorForm config={roiConfig} state={state} />}
      sticky={{ label: 'ROI', value: formatPercent(result.roi) }}
      results={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Your return</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultStat
                primary
                label="Return on investment"
                value={formatPercent(result.roi)}
                tone={result.isProfit ? 'gain' : 'loss'}
              />
              <div className="mt-4">
                <ResultGrid>
                  <ResultStat
                    label="Net profit"
                    value={formatCurrency(result.netProfit, currency)}
                    tone={result.isProfit ? 'gain' : 'loss'}
                  />
                  <ResultStat label="Annualized ROI" value={formatPercent(result.annualizedRoi)} />
                  <ResultStat label="Total invested" value={formatCurrency(result.totalInvested, currency)} />
                  <ResultStat label="Total returned" value={formatCurrency(result.totalReturned, currency)} />
                </ResultGrid>
              </div>
              {result.breakEvenMonths > 0 && (
                <p className="mt-4 text-sm text-ink-muted">
                  At this rate of return, the investment breaks even after {formatMonths(result.breakEvenMonths)}.
                </p>
              )}
            </CardContent>
          </Card>

          {result.isValid && (
            <Card>
              <CardContent className="pt-5">
                <DonutSplitChart
                  title="Invested vs. returned"
                  currency={currency}
                  slices={[
                    { label: 'Total invested', value: result.totalInvested, color: 'var(--series-1)' },
                    {
                      label: result.isProfit ? 'Profit' : 'Loss',
                      value: Math.abs(result.netProfit),
                      color: result.isProfit ? 'var(--gain)' : 'var(--loss)',
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
