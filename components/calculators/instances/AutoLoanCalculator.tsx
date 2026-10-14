'use client'

import * as React from 'react'

import { autoLoanConfig } from '@/config/calculators/autoLoan'
import { calculateAutoLoan } from '@/lib/calculators/autoLoan'
import { useCurrency } from '@/components/currency-provider'
import { formatCurrency } from '@/lib/formatting/currency'
import { CalculatorForm } from '@/components/calculators/shell/calculator-form'
import { CalculatorShell } from '@/components/calculators/shell/calculator-shell'
import { useCalculatorState } from '@/components/calculators/shell/use-calculator-state'
import { ResultStat, ResultGrid } from '@/components/calculators/result-stat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DonutSplitChart } from '@/components/charts/donut-split-chart'
import { AmortizationTable } from '@/components/calculators/amortization-table'

export function AutoLoanCalculator() {
  const state = useCalculatorState(autoLoanConfig)
  const { currency } = useCurrency()
  const v = state.values

  const result = React.useMemo(
    () =>
      calculateAutoLoan({
        vehiclePrice: Number(v.vehiclePrice),
        downPayment: Number(v.downPayment),
        tradeInValue: Number(v.tradeInValue),
        tradeInOwed: Number(v.tradeInOwed),
        salesTaxRate: Number(v.salesTaxRate),
        fees: Number(v.fees),
        financeTaxAndFees: Boolean(v.financeTaxAndFees),
        annualRate: Number(v.annualRate),
        termMonths: Number(v.termMonths),
      }),
    [
      v.vehiclePrice,
      v.downPayment,
      v.tradeInValue,
      v.tradeInOwed,
      v.salesTaxRate,
      v.fees,
      v.financeTaxAndFees,
      v.annualRate,
      v.termMonths,
    ]
  )

  return (
    <CalculatorShell
      form={<CalculatorForm config={autoLoanConfig} state={state} />}
      sticky={{ label: 'Monthly payment', value: formatCurrency(result.monthlyPayment, currency) }}
      results={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Your car payment</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultStat
                primary
                label="Monthly payment"
                value={formatCurrency(result.monthlyPayment, currency)}
              />
              <div className="mt-4">
                <ResultGrid>
                  <ResultStat label="Amount financed" value={formatCurrency(result.amountFinanced, currency)} />
                  <ResultStat label="Total interest" value={formatCurrency(result.totalInterest, currency)} />
                  <ResultStat
                    label="Total cost"
                    value={formatCurrency(result.totalCost, currency)}
                    hint="Cash at signing + all payments"
                  />
                  <ResultStat
                    label="Sales tax"
                    value={formatCurrency(result.salesTax, currency)}
                    hint={`On ${formatCurrency(result.taxableAmount, currency)} after trade-in`}
                  />
                  <ResultStat label="Cash due at signing" value={formatCurrency(result.upfrontCash, currency)} />
                  <ResultStat
                    label="Negative equity rolled in"
                    value={formatCurrency(result.negativeEquity, currency)}
                    tone={result.negativeEquity > 0 ? 'loss' : 'default'}
                  />
                </ResultGrid>
              </div>
              {result.negativeEquity > 0 && (
                <p className="mt-4 text-sm text-ink-muted">
                  You owe {formatCurrency(result.negativeEquity, currency)} more on your trade-in than
                  it is worth. That balance is added to the new loan, so you pay interest on it for the
                  full term.
                </p>
              )}
              {!result.isValid && (
                <p className="mt-4 text-sm text-ink-muted">
                  Your down payment and trade-in cover the full cost, so there is nothing to finance.
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
                    { label: 'Amount financed', value: result.amountFinanced, color: 'var(--series-1)' },
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
                <AmortizationTable rows={result.schedule} filename="auto-loan-amortization-schedule.csv" />
              </CardContent>
            </Card>
          )}
        </>
      }
    />
  )
}
