'use client'

import * as React from 'react'

import { loanConfig } from '@/config/calculators/loan'
import { calculateLoan } from '@/lib/calculators/loan'
import { useCurrency } from '@/components/currency-provider'
import { formatCurrency } from '@/lib/formatting/currency'
import { formatMonths, formatPercent } from '@/lib/formatting/number'
import { CalculatorForm } from '@/components/calculators/shell/calculator-form'
import { CalculatorShell } from '@/components/calculators/shell/calculator-shell'
import { useCalculatorState } from '@/components/calculators/shell/use-calculator-state'
import { ResultStat, ResultGrid } from '@/components/calculators/result-stat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DonutSplitChart } from '@/components/charts/donut-split-chart'
import { AmortizationTable } from '@/components/calculators/amortization-table'

export function LoanCalculator() {
  const state = useCalculatorState(loanConfig)
  const { currency } = useCurrency()
  const v = state.values

  const result = React.useMemo(
    () =>
      calculateLoan({
        loanAmount: Number(v.loanAmount),
        annualRate: Number(v.annualRate),
        termMonths: Number(v.termMonths),
        originationFee: Number(v.originationFee),
        extraMonthlyPayment: Number(v.extraMonthlyPayment),
      }),
    [v.loanAmount, v.annualRate, v.termMonths, v.originationFee, v.extraMonthlyPayment]
  )

  return (
    <CalculatorShell
      form={<CalculatorForm config={loanConfig} state={state} />}
      sticky={{ label: 'Monthly payment', value: formatCurrency(result.monthlyPayment, currency) }}
      results={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Your loan payment</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultStat primary label="Monthly payment" value={formatCurrency(result.monthlyPayment, currency)} />
              <div className="mt-4">
                <ResultGrid>
                  <ResultStat label="Total interest" value={formatCurrency(result.totalInterest, currency)} />
                  <ResultStat label="Total paid" value={formatCurrency(result.totalPaid, currency)} />
                  <ResultStat label="Amount disbursed" value={formatCurrency(result.amountDisbursed, currency)} />
                  <ResultStat label="Effective APR" value={formatPercent(result.effectiveApr)} />
                </ResultGrid>
              </div>
              {result.monthsToPayoff > 0 && (
                <p className="mt-4 text-sm text-ink-muted">
                  Paid off in {formatMonths(result.monthsToPayoff)}. Interest adds{' '}
                  {formatPercent(result.interestToPrincipalRatio)} on top of what you borrowed.
                </p>
              )}
            </CardContent>
          </Card>

          {result.isValid && (
            <Card>
              <CardContent className="pt-5">
                <DonutSplitChart
                  title="Principal vs. interest"
                  currency={currency}
                  slices={[
                    { label: 'Principal', value: Number(v.loanAmount), color: 'var(--series-1)' },
                    { label: 'Interest', value: result.totalInterest, color: 'var(--series-2)' },
                  ]}
                />
              </CardContent>
            </Card>
          )}

          {result.isValid && (
            <Card>
              <CardHeader>
                <CardTitle>Amortization schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <AmortizationTable rows={result.schedule} filename="loan-amortization-schedule.csv" />
              </CardContent>
            </Card>
          )}
        </>
      }
    />
  )
}
