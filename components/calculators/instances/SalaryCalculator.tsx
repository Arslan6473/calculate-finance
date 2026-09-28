'use client'

import * as React from 'react'

import { salaryConfig } from '@/config/calculators/salary'
import { calculateSalary } from '@/lib/calculators/salary'
import type { FilingStatus, PayFrequency } from '@/lib/tax/us-federal-2026'
import { TAX_YEAR } from '@/lib/tax/us-federal-2026'
import { useCurrency } from '@/components/currency-provider'
import { formatCurrency } from '@/lib/formatting/currency'
import { formatPercent } from '@/lib/formatting/number'
import { CalculatorForm } from '@/components/calculators/shell/calculator-form'
import { CalculatorShell } from '@/components/calculators/shell/calculator-shell'
import { useCalculatorState } from '@/components/calculators/shell/use-calculator-state'
import { ResultStat, ResultGrid } from '@/components/calculators/result-stat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DonutSplitChart } from '@/components/charts/donut-split-chart'

export function SalaryCalculator() {
  const state = useCalculatorState(salaryConfig)
  const { currency } = useCurrency()
  const v = state.values

  const result = React.useMemo(
    () =>
      calculateSalary({
        amount: Number(v.amount),
        payBasis: v.payBasis as 'hourly' | PayFrequency,
        payFrequency: v.payFrequency as PayFrequency,
        filingStatus: v.filingStatus as FilingStatus,
        hoursPerWeek: Number(v.hoursPerWeek),
        stateTaxRate: Number(v.stateTaxRate),
        preTaxDeductions: Number(v.preTaxDeductions),
        postTaxDeductions: Number(v.postTaxDeductions),
      }),
    [v.amount, v.payBasis, v.payFrequency, v.filingStatus, v.hoursPerWeek, v.stateTaxRate, v.preTaxDeductions, v.postTaxDeductions]
  )

  return (
    <CalculatorShell
      form={<CalculatorForm config={salaryConfig} state={state} />}
      sticky={{ label: 'Take-home per paycheck', value: formatCurrency(result.netPerPaycheck, currency) }}
      results={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Your take-home pay</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultStat primary label="Net annual pay" value={formatCurrency(result.netAnnual, currency)} />
              <div className="mt-4">
                <ResultGrid>
                  <ResultStat label="Net per paycheck" value={formatCurrency(result.netPerPaycheck, currency)} />
                  <ResultStat label="Net per month" value={formatCurrency(result.netMonthly, currency)} />
                  <ResultStat label="Take-home %" value={formatPercent(result.takeHomePercent)} />
                  <ResultStat label="Effective tax rate" value={formatPercent(result.effectiveTaxRate)} />
                </ResultGrid>
              </div>
              <div className="mt-4">
                <ResultGrid>
                  <ResultStat label="Federal tax" value={formatCurrency(result.federalTax, currency)} />
                  <ResultStat label="Social Security" value={formatCurrency(result.socialSecurity, currency)} />
                  <ResultStat label="Medicare" value={formatCurrency(result.medicare + result.additionalMedicare, currency)} />
                  <ResultStat label="State + local tax" value={formatCurrency(result.stateTax, currency)} />
                </ResultGrid>
              </div>
              <p className="mt-4 text-xs text-ink-subtle">
                Based on {TAX_YEAR} US federal tax brackets and FICA. Marginal federal rate:{' '}
                {formatPercent(result.marginalTaxRate)}. State and local tax uses the flat rate you entered.
              </p>
            </CardContent>
          </Card>

          {result.isValid && (
            <Card>
              <CardContent className="pt-5">
                <DonutSplitChart
                  title="Gross pay breakdown"
                  currency={currency}
                  slices={[
                    { label: 'Take-home', value: result.netAnnual, color: 'var(--gain)' },
                    { label: 'Federal tax', value: result.federalTax, color: 'var(--series-2)' },
                    { label: 'FICA', value: result.socialSecurity + result.medicare + result.additionalMedicare, color: 'var(--series-4)' },
                    { label: 'State + local tax', value: result.stateTax, color: 'var(--series-5)' },
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
