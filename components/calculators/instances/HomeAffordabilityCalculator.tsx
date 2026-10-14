'use client'

import * as React from 'react'

import { homeAffordabilityConfig } from '@/config/calculators/homeAffordability'
import { calculateHomeAffordability } from '@/lib/calculators/homeAffordability'
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

const BINDING_RULE_LABEL = {
  'front-end': 'Housing limit binds',
  'back-end': 'Total-debt limit binds',
} as const

export function HomeAffordabilityCalculator() {
  const state = useCalculatorState(homeAffordabilityConfig)
  const { currency } = useCurrency()
  const v = state.values

  const result = React.useMemo(
    () =>
      calculateHomeAffordability({
        annualIncome: Number(v.annualIncome),
        monthlyDebts: Number(v.monthlyDebts),
        downPayment: Number(v.downPayment),
        annualRate: Number(v.annualRate),
        termYears: Number(v.termYears),
        propertyTaxRate: Number(v.propertyTaxRate),
        annualHomeInsurance: Number(v.annualHomeInsurance),
        monthlyHoa: Number(v.monthlyHoa),
        frontEndDti: Number(v.frontEndDti),
        backEndDti: Number(v.backEndDti),
      }),
    [
      v.annualIncome,
      v.monthlyDebts,
      v.downPayment,
      v.annualRate,
      v.termYears,
      v.propertyTaxRate,
      v.annualHomeInsurance,
      v.monthlyHoa,
      v.frontEndDti,
      v.backEndDti,
    ]
  )

  return (
    <CalculatorShell
      form={<CalculatorForm config={homeAffordabilityConfig} state={state} />}
      sticky={{ label: 'Maximum home price', value: formatCurrency(result.maxHomePrice, currency) }}
      results={
        <>
          <Card>
            <CardHeader>
              <CardTitle>How much house you can afford</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between gap-3">
                <ResultStat
                  primary
                  label="Maximum home price"
                  value={formatCurrency(result.maxHomePrice, currency)}
                />
                {result.isValid && (
                  <Badge variant="outline">{BINDING_RULE_LABEL[result.bindingRule]}</Badge>
                )}
              </div>
              <div className="mt-4">
                <ResultGrid>
                  <ResultStat
                    label="Max monthly housing payment"
                    value={formatCurrency(result.maxMonthlyHousingPayment, currency)}
                  />
                  <ResultStat label="Loan amount" value={formatCurrency(result.loanAmount, currency)} />
                  <ResultStat
                    label="Front-end limit"
                    value={formatCurrency(result.frontEndLimit, currency)}
                    hint="Housing only"
                  />
                  <ResultStat
                    label="Back-end limit"
                    value={formatCurrency(result.backEndLimit, currency)}
                    hint="Housing after existing debts"
                  />
                </ResultGrid>
              </div>
              {!result.isValid && (
                <p className="mt-4 text-sm text-ink-muted">
                  With these inputs, insurance, HOA and existing debts use up the whole housing
                  budget, so no home price fits the limits.
                </p>
              )}
            </CardContent>
          </Card>

          {result.isValid && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly payment at this price</CardTitle>
              </CardHeader>
              <CardContent>
                <ResultGrid>
                  <ResultStat label="Principal & interest" value={formatCurrency(result.principalAndInterest, currency)} />
                  <ResultStat label="Property tax" value={formatCurrency(result.monthlyPropertyTax, currency)} />
                  <ResultStat label="Home insurance" value={formatCurrency(result.monthlyHomeInsurance, currency)} />
                  <ResultStat label="HOA" value={formatCurrency(result.monthlyHoa, currency)} />
                </ResultGrid>
                <p className="mt-4 text-sm text-ink-muted">
                  Total {formatCurrency(result.totalMonthlyPayment, currency)} a month — a{' '}
                  {formatPercent(result.frontEndRatio, 1)} housing ratio and a{' '}
                  {formatPercent(result.backEndRatio, 1)} total debt-to-income ratio, with{' '}
                  {formatPercent(result.downPaymentPercent, 1)} down.
                </p>
                <div className="mt-6">
                  <DonutSplitChart
                    title="Where the monthly payment goes"
                    currency={currency}
                    slices={[
                      { label: 'Principal & interest', value: result.principalAndInterest, color: 'var(--series-1)' },
                      { label: 'Property tax', value: result.monthlyPropertyTax, color: 'var(--series-2)' },
                      { label: 'Insurance', value: result.monthlyHomeInsurance, color: 'var(--series-3)' },
                      { label: 'HOA', value: result.monthlyHoa, color: 'var(--series-4)' },
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
