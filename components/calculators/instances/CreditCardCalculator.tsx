'use client'

import * as React from 'react'

import { creditCardConfig } from '@/config/calculators/creditCard'
import { calculateCreditCardPayoff } from '@/lib/calculators/creditCard'
import { useCurrency } from '@/components/currency-provider'
import { formatCurrency } from '@/lib/formatting/currency'
import { formatMonths } from '@/lib/formatting/number'
import { CalculatorForm } from '@/components/calculators/shell/calculator-form'
import { CalculatorShell } from '@/components/calculators/shell/calculator-shell'
import { useCalculatorState } from '@/components/calculators/shell/use-calculator-state'
import { ResultStat, ResultGrid } from '@/components/calculators/result-stat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BalanceLineChart } from '@/components/charts/balance-line-chart'
import { ComparisonBarChart } from '@/components/charts/comparison-bar-chart'

export function CreditCardCalculator() {
  const state = useCalculatorState(creditCardConfig)
  const { currency } = useCurrency()
  const v = state.values

  const result = React.useMemo(
    () =>
      calculateCreditCardPayoff({
        balance: Number(v.balance),
        annualRate: Number(v.annualRate),
        paymentMode: v.paymentMode as 'fixed' | 'minimum',
        fixedPayment: Number(v.fixedPayment),
        minimumPercent: Number(v.minimumPercent),
        minimumFloor: Number(v.minimumFloor),
        monthlyPurchases: Number(v.monthlyPurchases),
      }),
    [v.balance, v.annualRate, v.paymentMode, v.fixedPayment, v.minimumPercent, v.minimumFloor, v.monthlyPurchases]
  )

  return (
    <CalculatorShell
      form={<CalculatorForm config={creditCardConfig} state={state} />}
      sticky={
        result.payoffPossible
          ? { label: 'Paid off in', value: formatMonths(result.monthsToPayoff) }
          : { label: 'Payoff status', value: 'Never at this payment' }
      }
      results={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Your payoff timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {result.payoffPossible ? (
                <>
                  <ResultStat primary label="Paid off in" value={formatMonths(result.monthsToPayoff)} />
                  <div className="mt-4">
                    <ResultGrid>
                      <ResultStat label="Total interest paid" value={formatCurrency(result.totalInterest, currency)} />
                      <ResultStat label="Total paid" value={formatCurrency(result.totalPaid, currency)} />
                      <ResultStat label="First payment" value={formatCurrency(result.firstPayment, currency)} />
                      <ResultStat
                        label="Interest vs. balance"
                        value={`${result.interestToBalanceRatio}%`}
                      />
                    </ResultGrid>
                  </div>
                  {result.minimumComparison && (
                    <p className="mt-4 text-sm text-ink-muted">
                      {result.minimumComparison.payoffPossible
                        ? `Paying only the minimum would take ${formatMonths(result.minimumComparison.monthsToPayoff)} and cost ${formatCurrency(result.minimumComparison.totalInterest, currency)} in interest — the minimum-payment trap.`
                        : 'Paying only the minimum would never pay this balance off at all.'}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-loss">
                  This payment does not cover the interest accruing on the balance, so it will never
                  reach zero. Increase your monthly payment to see a payoff date.
                </p>
              )}
            </CardContent>
          </Card>

          {result.minimumComparison?.payoffPossible && result.payoffPossible && (
            <Card>
              <CardContent className="pt-5">
                <ComparisonBarChart
                  title="Total interest: your plan vs. minimum only"
                  currency={currency}
                  bars={[
                    { label: 'Your payment', value: result.totalInterest, color: 'var(--series-1)' },
                    { label: 'Minimum only', value: result.minimumComparison.totalInterest, color: 'var(--loss)' },
                  ]}
                />
              </CardContent>
            </Card>
          )}

          {result.payoffPossible && result.schedule.length > 0 && (
            <Card>
              <CardContent className="pt-5">
                <BalanceLineChart
                  title="Balance over time"
                  xLabel="Month"
                  currency={currency}
                  series={[
                    {
                      name: 'Balance',
                      color: 'var(--series-1)',
                      points: result.schedule.map((r) => ({ x: r.month, y: r.balance })),
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
