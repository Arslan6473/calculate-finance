'use client'

import * as React from 'react'

import { rentalPropertyConfig } from '@/config/calculators/rentalProperty'
import { calculateRentalProperty } from '@/lib/calculators/rentalProperty'
import { useCurrency } from '@/components/currency-provider'
import { formatCurrency } from '@/lib/formatting/currency'
import { formatNumber, formatPercent } from '@/lib/formatting/number'
import { CalculatorForm } from '@/components/calculators/shell/calculator-form'
import { CalculatorShell } from '@/components/calculators/shell/calculator-shell'
import { useCalculatorState } from '@/components/calculators/shell/use-calculator-state'
import { ResultStat, ResultGrid } from '@/components/calculators/result-stat'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DonutSplitChart } from '@/components/charts/donut-split-chart'

export function RentalPropertyCalculator() {
  const state = useCalculatorState(rentalPropertyConfig)
  const { currency } = useCurrency()
  const v = state.values

  const result = React.useMemo(
    () =>
      calculateRentalProperty({
        purchasePrice: Number(v.purchasePrice),
        downPaymentPercent: Number(v.downPaymentPercent),
        closingCosts: Number(v.closingCosts),
        annualRate: Number(v.annualRate),
        termYears: Number(v.termYears),
        monthlyRent: Number(v.monthlyRent),
        vacancyPercent: Number(v.vacancyPercent),
        annualPropertyTax: Number(v.annualPropertyTax),
        annualInsurance: Number(v.annualInsurance),
        maintenancePercent: Number(v.maintenancePercent),
        managementPercent: Number(v.managementPercent),
        monthlyHoa: Number(v.monthlyHoa),
        monthlyOther: Number(v.monthlyOther),
      }),
    [
      v.purchasePrice,
      v.downPaymentPercent,
      v.closingCosts,
      v.annualRate,
      v.termYears,
      v.monthlyRent,
      v.vacancyPercent,
      v.annualPropertyTax,
      v.annualInsurance,
      v.maintenancePercent,
      v.managementPercent,
      v.monthlyHoa,
      v.monthlyOther,
    ]
  )

  const cashFlowTone = result.monthlyCashFlow >= 0 ? 'gain' : 'loss'

  return (
    <CalculatorShell
      form={<CalculatorForm config={rentalPropertyConfig} state={state} />}
      sticky={result.isValid ? { label: 'Monthly cash flow', value: formatCurrency(result.monthlyCashFlow, currency) } : null}
      results={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Cash flow and returns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between gap-3">
                <ResultStat
                  primary
                  label="Monthly cash flow"
                  value={formatCurrency(result.monthlyCashFlow, currency)}
                  tone={cashFlowTone}
                />
                {result.isValid && (
                  <Badge variant={result.passesOnePercentRule ? 'gain' : 'outline'}>
                    {result.passesOnePercentRule ? 'Passes 1% rule' : 'Below 1% rule'}
                  </Badge>
                )}
              </div>
              <div className="mt-4">
                <ResultGrid>
                  <ResultStat
                    label="Annual cash flow"
                    value={formatCurrency(result.annualCashFlow, currency)}
                    tone={cashFlowTone}
                  />
                  <ResultStat label="Net operating income" value={formatCurrency(result.annualNoi, currency)} hint="Per year, before mortgage" />
                  <ResultStat label="Cap rate" value={formatPercent(result.capRate)} hint="NOI ÷ price" />
                  <ResultStat label="Cash-on-cash return" value={formatPercent(result.cashOnCashReturn)} hint="Cash flow ÷ cash invested" />
                  <ResultStat label="Gross rent multiplier" value={formatNumber(result.grossRentMultiplier, 2)} hint="Price ÷ annual rent" />
                  <ResultStat
                    label="Rent-to-price ratio"
                    value={formatPercent(result.rentToPricePercent)}
                    hint="1% rule target: 1%"
                  />
                </ResultGrid>
              </div>
              {result.isValid && (
                <p className="mt-4 text-sm text-ink-muted">
                  Cash invested: {formatCurrency(result.totalCashInvested, currency)} (down payment plus
                  closing costs) on a {formatCurrency(result.loanAmount, currency)} loan.
                  {result.debtServiceCoverage !== null &&
                    ` NOI covers the mortgage ${formatNumber(result.debtServiceCoverage, 2)}×.`}
                </p>
              )}
            </CardContent>
          </Card>

          {result.isValid && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly income and costs</CardTitle>
              </CardHeader>
              <CardContent>
                <ResultGrid>
                  <ResultStat label="Rent after vacancy" value={formatCurrency(result.effectiveMonthlyRent, currency)} />
                  <ResultStat label="Operating expenses" value={formatCurrency(result.monthlyOperatingExpenses, currency)} />
                  <ResultStat label="Mortgage (P&I)" value={formatCurrency(result.monthlyMortgagePayment, currency)} />
                  <ResultStat label="Vacancy allowance" value={formatCurrency(result.monthlyVacancyLoss, currency)} />
                </ResultGrid>
                <div className="mt-6">
                  <DonutSplitChart
                    title="Monthly costs breakdown"
                    currency={currency}
                    slices={[
                      { label: 'Mortgage', value: result.monthlyMortgagePayment, color: 'var(--series-1)' },
                      { label: 'Tax & insurance', value: result.monthlyPropertyTax + result.monthlyInsurance, color: 'var(--series-2)' },
                      { label: 'Maintenance', value: result.monthlyMaintenance, color: 'var(--series-3)' },
                      { label: 'Management', value: result.monthlyManagement, color: 'var(--series-4)' },
                      { label: 'HOA & other', value: result.monthlyHoa + result.monthlyOther, color: 'var(--series-5)' },
                    ].filter((slice) => slice.value > 0)}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </>
      }
    />
  )
}
