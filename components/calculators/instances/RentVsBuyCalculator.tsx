'use client'

import * as React from 'react'

import { rentVsBuyConfig } from '@/config/calculators/rentVsBuy'
import { calculateRentVsBuy } from '@/lib/calculators/rentVsBuy'
import { useCurrency } from '@/components/currency-provider'
import { formatCurrency } from '@/lib/formatting/currency'
import { CalculatorForm } from '@/components/calculators/shell/calculator-form'
import { CalculatorShell } from '@/components/calculators/shell/calculator-shell'
import { useCalculatorState } from '@/components/calculators/shell/use-calculator-state'
import { ResultStat, ResultGrid } from '@/components/calculators/result-stat'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BalanceLineChart } from '@/components/charts/balance-line-chart'

const RECOMMENDATION_LABEL = {
  buy: 'Buying wins',
  rent: 'Renting wins',
  tooClose: 'Too close to call',
} as const

export function RentVsBuyCalculator() {
  const state = useCalculatorState(rentVsBuyConfig)
  const { currency } = useCurrency()
  const v = state.values

  const result = React.useMemo(
    () =>
      calculateRentVsBuy({
        homePrice: Number(v.homePrice),
        downPayment: Number(v.downPayment),
        mortgageRate: Number(v.mortgageRate),
        mortgageTermYears: Number(v.mortgageTermYears),
        propertyTaxRate: Number(v.propertyTaxRate),
        annualHomeInsurance: Number(v.annualHomeInsurance),
        annualMaintenancePercent: Number(v.annualMaintenancePercent),
        buyingCostPercent: Number(v.buyingCostPercent),
        sellingCostPercent: Number(v.sellingCostPercent),
        homeAppreciationRate: Number(v.homeAppreciationRate),
        monthlyRent: Number(v.monthlyRent),
        annualRentIncrease: Number(v.annualRentIncrease),
        yearsStaying: Number(v.yearsStaying),
        investmentReturnRate: Number(v.investmentReturnRate),
      }),
    [
      v.homePrice,
      v.downPayment,
      v.mortgageRate,
      v.mortgageTermYears,
      v.propertyTaxRate,
      v.annualHomeInsurance,
      v.annualMaintenancePercent,
      v.buyingCostPercent,
      v.sellingCostPercent,
      v.homeAppreciationRate,
      v.monthlyRent,
      v.annualRentIncrease,
      v.yearsStaying,
      v.investmentReturnRate,
    ]
  )

  return (
    <CalculatorShell
      form={<CalculatorForm config={rentVsBuyConfig} state={state} />}
      sticky={result.isValid ? { label: RECOMMENDATION_LABEL[result.recommendation], value: formatCurrency(Math.abs(result.savingsFromBuying), currency) } : null}
      results={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Which costs less?</CardTitle>
            </CardHeader>
            <CardContent>
              {result.isValid && (
                <div className="flex items-baseline justify-between gap-3">
                  <ResultStat
                    primary
                    label="Net savings from buying"
                    value={formatCurrency(result.savingsFromBuying, currency)}
                    tone={result.savingsFromBuying >= 0 ? 'gain' : 'loss'}
                  />
                  <Badge variant={result.recommendation === 'tooClose' ? 'outline' : result.savingsFromBuying >= 0 ? 'gain' : 'loss'}>
                    {RECOMMENDATION_LABEL[result.recommendation]}
                  </Badge>
                </div>
              )}
              <div className="mt-4">
                <ResultGrid>
                  <ResultStat label="Total cost of buying" value={formatCurrency(result.totalBuyCost, currency)} />
                  <ResultStat label="Total cost of renting" value={formatCurrency(result.totalRentCost, currency)} />
                  <ResultStat label="Monthly mortgage payment" value={formatCurrency(result.monthlyMortgagePayment, currency)} />
                  <ResultStat label="Initial monthly rent" value={formatCurrency(result.initialMonthlyRent, currency)} />
                </ResultGrid>
              </div>
              {result.breakEvenYear !== null && (
                <p className="mt-4 text-sm text-ink-muted">
                  Buying becomes cheaper than renting starting in year {result.breakEvenYear}.
                </p>
              )}
            </CardContent>
          </Card>

          {result.isValid && result.yearly.length > 0 && (
            <Card>
              <CardContent className="pt-5">
                <BalanceLineChart
                  title="Net cost over time: buy vs. rent"
                  xLabel="Year"
                  currency={currency}
                  series={[
                    { name: 'Cost of buying', color: 'var(--series-1)', points: result.yearly.map((y) => ({ x: y.year, y: y.cumulativeBuyCost })) },
                    { name: 'Cost of renting', color: 'var(--series-2)', points: result.yearly.map((y) => ({ x: y.year, y: y.cumulativeRentCost })) },
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
