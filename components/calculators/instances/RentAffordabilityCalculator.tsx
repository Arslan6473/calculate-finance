'use client'

import * as React from 'react'

import { rentAffordabilityConfig } from '@/config/calculators/rentAffordability'
import {
  calculateRentAffordability,
  type IncomeFrequency,
  type RentRule,
} from '@/lib/calculators/rentAffordability'
import { useCurrency } from '@/components/currency-provider'
import { formatCurrency } from '@/lib/formatting/currency'
import { CalculatorForm } from '@/components/calculators/shell/calculator-form'
import { CalculatorShell } from '@/components/calculators/shell/calculator-shell'
import { useCalculatorState } from '@/components/calculators/shell/use-calculator-state'
import { ResultStat, ResultGrid } from '@/components/calculators/result-stat'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ComparisonBarChart } from '@/components/charts/comparison-bar-chart'

const RULE_LABEL: Record<RentRule, string> = {
  incomeShare: 'Income-share rule',
  needsBudget: '50/30/20 needs budget',
  incomeMultiple: 'Landlord 40× rule',
  debtToIncome: '36% debt-to-income',
}

export function RentAffordabilityCalculator() {
  const state = useCalculatorState(rentAffordabilityConfig)
  const { currency } = useCurrency()
  const v = state.values

  const result = React.useMemo(
    () =>
      calculateRentAffordability({
        grossIncome: Number(v.grossIncome),
        incomeFrequency: v.incomeFrequency as IncomeFrequency,
        takeHomePercent: Number(v.takeHomePercent),
        monthlyDebts: Number(v.monthlyDebts),
        monthlyEssentials: Number(v.monthlyEssentials),
        rentSharePercent: Number(v.rentSharePercent),
      }),
    [
      v.grossIncome,
      v.incomeFrequency,
      v.takeHomePercent,
      v.monthlyDebts,
      v.monthlyEssentials,
      v.rentSharePercent,
    ]
  )

  return (
    <CalculatorShell
      form={<CalculatorForm config={rentAffordabilityConfig} state={state} />}
      sticky={{ label: 'Recommended max rent', value: formatCurrency(result.recommendedMaxRent, currency) }}
      results={
        <>
          <Card>
            <CardHeader>
              <CardTitle>How much rent you can afford</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between gap-3">
                <ResultStat
                  primary
                  label="Recommended max rent"
                  value={formatCurrency(result.recommendedMaxRent, currency)}
                  hint="The lowest of the four rules below"
                />
                {result.isValid && <Badge variant="outline">{RULE_LABEL[result.limitingRule]}</Badge>}
              </div>
              <div className="mt-4">
                <ResultGrid>
                  <ResultStat
                    label={`${Number(v.rentSharePercent)}% of gross income`}
                    value={formatCurrency(result.byIncomeShare, currency)}
                  />
                  <ResultStat
                    label="50/30/20 needs budget"
                    value={formatCurrency(result.byNeedsBudget, currency)}
                    hint="Half of take-home, less debts & essentials"
                  />
                  <ResultStat
                    label="Landlord 40× rule"
                    value={formatCurrency(result.byIncomeMultiple, currency)}
                    hint="Annual income ÷ 40"
                  />
                  <ResultStat
                    label="36% debt-to-income"
                    value={formatCurrency(result.byDebtToIncome, currency)}
                    hint="Rent plus debts within 36% of gross"
                  />
                </ResultGrid>
              </div>
              {result.isValid && (
                <p className="mt-4 text-sm text-ink-muted">
                  Based on {formatCurrency(result.grossMonthlyIncome, currency)} gross and about{' '}
                  {formatCurrency(result.takeHomeMonthlyIncome, currency)} take-home per month. These are
                  rules of thumb — your own budget is the better guide.
                </p>
              )}
            </CardContent>
          </Card>

          {result.isValid && (
            <Card>
              <CardContent className="pt-5">
                <ComparisonBarChart
                  title="Maximum rent by rule"
                  currency={currency}
                  bars={[
                    { label: 'Income share', value: result.byIncomeShare, color: 'var(--series-1)' },
                    { label: '50/30/20', value: result.byNeedsBudget, color: 'var(--series-2)' },
                    { label: '40× rule', value: result.byIncomeMultiple, color: 'var(--series-3)' },
                    { label: '36% DTI', value: result.byDebtToIncome, color: 'var(--series-4)' },
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
