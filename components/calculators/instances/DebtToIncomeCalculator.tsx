'use client'

import * as React from 'react'

import { debtToIncomeConfig } from '@/config/calculators/debtToIncome'
import { calculateDebtToIncome, type DtiBand } from '@/lib/calculators/debtToIncome'
import { useCurrency } from '@/components/currency-provider'
import { formatCurrency } from '@/lib/formatting/currency'
import { formatPercent } from '@/lib/formatting/number'
import { CalculatorForm } from '@/components/calculators/shell/calculator-form'
import { CalculatorShell } from '@/components/calculators/shell/calculator-shell'
import { useCalculatorState } from '@/components/calculators/shell/use-calculator-state'
import { ResultStat, ResultGrid } from '@/components/calculators/result-stat'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DonutSplitChart } from '@/components/charts/donut-split-chart'

const BAND: Record<DtiBand, { label: string; variant: 'gain' | 'outline' | 'loss'; note: string }> = {
  'within-36': {
    label: 'At or below 36%',
    variant: 'gain',
    note: 'Within the common 36% conventional guideline.',
  },
  'between-36-43': {
    label: '36% to 43%',
    variant: 'outline',
    note: 'Above the 36% conventional guideline but at or below the 43% Qualified Mortgage reference. Many lenders still approve this range; terms vary.',
  },
  'above-43': {
    label: 'Above 43%',
    variant: 'loss',
    note: 'Above the 43% reference point. Some programs allow higher ratios, but approval is harder and the budget is tight.',
  },
}

export function DebtToIncomeCalculator() {
  const state = useCalculatorState(debtToIncomeConfig)
  const { currency } = useCurrency()
  const v = state.values

  const result = React.useMemo(
    () =>
      calculateDebtToIncome({
        grossMonthlyIncome: Number(v.grossMonthlyIncome),
        otherMonthlyIncome: Number(v.otherMonthlyIncome),
        housingPayment: Number(v.housingPayment),
        carLoans: Number(v.carLoans),
        studentLoans: Number(v.studentLoans),
        creditCardMinimums: Number(v.creditCardMinimums),
        otherDebts: Number(v.otherDebts),
      }),
    [
      v.grossMonthlyIncome,
      v.otherMonthlyIncome,
      v.housingPayment,
      v.carLoans,
      v.studentLoans,
      v.creditCardMinimums,
      v.otherDebts,
    ]
  )

  const band = BAND[result.band]
  const housing = Number(v.housingPayment)
  const otherDebt = Math.max(0, result.totalMonthlyDebt - housing)
  const remaining = Math.max(0, result.totalMonthlyIncome - result.totalMonthlyDebt)

  return (
    <CalculatorShell
      form={<CalculatorForm config={debtToIncomeConfig} state={state} />}
      sticky={{ label: 'Back-end DTI', value: formatPercent(result.backEndDti, 1) }}
      results={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Your debt-to-income ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between gap-3">
                <ResultStat primary label="Back-end DTI" value={formatPercent(result.backEndDti, 1)} />
                {result.isValid && <Badge variant={band.variant}>{band.label}</Badge>}
              </div>
              <div className="mt-4">
                <ResultGrid>
                  <ResultStat
                    label="Front-end DTI"
                    value={formatPercent(result.frontEndDti, 1)}
                    hint="Housing only"
                  />
                  <ResultStat
                    label="Total monthly debt"
                    value={formatCurrency(result.totalMonthlyDebt, currency)}
                  />
                  <ResultStat
                    label="Total monthly income"
                    value={formatCurrency(result.totalMonthlyIncome, currency)}
                  />
                  {result.cutTo36 > 0 ? (
                    <ResultStat
                      label="Cut to reach 36%"
                      value={formatCurrency(result.cutTo36, currency)}
                      tone="loss"
                      hint="Per month"
                    />
                  ) : (
                    <ResultStat
                      label="Room before 36%"
                      value={formatCurrency(result.roomTo36, currency)}
                      tone="gain"
                      hint="Per month"
                    />
                  )}
                </ResultGrid>
              </div>
              <p className="mt-4 text-sm text-ink-muted">
                {result.isValid
                  ? `${band.note} Lenders vary, and these are common guidelines rather than approval rules.`
                  : 'Enter your gross monthly income to calculate your ratios.'}
              </p>
            </CardContent>
          </Card>

          {result.isValid && (
            <Card>
              <CardContent className="pt-5">
                <DonutSplitChart
                  title="Where your gross income goes"
                  currency={currency}
                  slices={[
                    { label: 'Housing', value: housing, color: 'var(--series-1)' },
                    { label: 'Other debts', value: otherDebt, color: 'var(--series-2)' },
                    { label: 'Left after debts', value: remaining, color: 'var(--series-3)' },
                  ].filter((slice) => slice.value > 0)}
                />
              </CardContent>
            </Card>
          )}
        </>
      }
    />
  )
}
