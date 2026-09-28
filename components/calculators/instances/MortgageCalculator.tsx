'use client'

import * as React from 'react'

import { mortgageConfig } from '@/config/calculators/mortgage'
import { calculateMortgage } from '@/lib/calculators/mortgage'
import { useCurrency } from '@/components/currency-provider'
import { formatCurrency } from '@/lib/formatting/currency'
import { formatMonths, formatPayoffDate } from '@/lib/formatting/number'
import { CalculatorForm } from '@/components/calculators/shell/calculator-form'
import { CalculatorShell } from '@/components/calculators/shell/calculator-shell'
import { useCalculatorState } from '@/components/calculators/shell/use-calculator-state'
import { ResultStat, ResultGrid } from '@/components/calculators/result-stat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DonutSplitChart } from '@/components/charts/donut-split-chart'
import { BalanceLineChart } from '@/components/charts/balance-line-chart'
import { AmortizationTable } from '@/components/calculators/amortization-table'

export function MortgageCalculator() {
  const state = useCalculatorState(mortgageConfig)
  const { currency } = useCurrency()
  const v = state.values

  const result = React.useMemo(
    () =>
      calculateMortgage({
        homePrice: Number(v.homePrice),
        downPayment: Number(v.downPayment),
        termYears: Number(v.termYears),
        annualRate: Number(v.annualRate),
        annualPropertyTax: Number(v.annualPropertyTax),
        annualHomeInsurance: Number(v.annualHomeInsurance),
        monthlyHoa: Number(v.monthlyHoa),
        pmiRate: Number(v.pmiRate),
        extraMonthlyPayment: Number(v.extraMonthlyPayment),
      }),
    [v.homePrice, v.downPayment, v.termYears, v.annualRate, v.annualPropertyTax, v.annualHomeInsurance, v.monthlyHoa, v.pmiRate, v.extraMonthlyPayment]
  )

  return (
    <CalculatorShell
      form={<CalculatorForm config={mortgageConfig} state={state} />}
      sticky={{ label: 'Total monthly payment', value: formatCurrency(result.totalMonthlyPayment, currency) }}
      results={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Your monthly payment</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultStat
                primary
                label="Total monthly payment"
                value={formatCurrency(result.totalMonthlyPayment, currency)}
              />
              <div className="mt-4">
                <ResultGrid>
                  <ResultStat label="Principal & interest" value={formatCurrency(result.principalAndInterest, currency)} />
                  <ResultStat label="Property tax" value={formatCurrency(result.monthlyPropertyTax, currency)} />
                  <ResultStat label="Home insurance" value={formatCurrency(result.monthlyHomeInsurance, currency)} />
                  <ResultStat label="HOA + PMI" value={formatCurrency(result.monthlyHoa + result.monthlyPmi, currency)} />
                </ResultGrid>
              </div>
              <div className="mt-4">
                <ResultGrid>
                  <ResultStat label="Total interest" value={formatCurrency(result.totalInterest, currency)} />
                  <ResultStat label="Total cost of ownership" value={formatCurrency(result.totalCostOfOwnership, currency)} />
                  <ResultStat label="Loan amount" value={formatCurrency(result.loanAmount, currency)} />
                  <ResultStat label="Down payment" value={`${result.downPaymentPercent}%`} />
                </ResultGrid>
              </div>
              {result.monthsToPayoff > 0 && (
                <p className="mt-4 text-sm text-ink-muted">
                  Paid off in {formatMonths(result.monthsToPayoff)}, around {formatPayoffDate(result.monthsToPayoff)}.
                  {result.pmiMonths > 0 &&
                    ` PMI applies for the first ${formatMonths(result.pmiMonths)}.`}
                </p>
              )}
            </CardContent>
          </Card>

          {result.isValid && (
            <Card>
              <CardContent className="grid gap-8 pt-5 sm:grid-cols-2">
                <DonutSplitChart
                  title="Principal vs. interest"
                  currency={currency}
                  slices={[
                    { label: 'Principal', value: result.loanAmount, color: 'var(--series-1)' },
                    { label: 'Interest', value: result.totalInterest, color: 'var(--series-2)' },
                  ]}
                />
                <BalanceLineChart
                  title="Remaining balance over time"
                  xLabel="Year"
                  currency={currency}
                  series={[
                    {
                      name: 'Balance',
                      color: 'var(--series-1)',
                      points: result.schedule
                        .filter((r) => r.period % 12 === 0 || r.period === result.schedule.length)
                        .map((r) => ({ x: r.year, y: r.balance })),
                    },
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
                <AmortizationTable rows={result.schedule} filename="mortgage-amortization-schedule.csv" />
              </CardContent>
            </Card>
          )}
        </>
      }
    />
  )
}
