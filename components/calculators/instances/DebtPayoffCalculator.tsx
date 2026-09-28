'use client'

import * as React from 'react'
import { Plus, Trash2 } from 'lucide-react'

import { debtPayoffConfig } from '@/config/calculators/debtPayoff'
import { compareStrategies, type Debt, type PayoffStrategy } from '@/lib/calculators/debtPayoff'
import { useCurrency } from '@/components/currency-provider'
import { formatCurrency } from '@/lib/formatting/currency'
import { formatMonths } from '@/lib/formatting/number'
import { CalculatorForm } from '@/components/calculators/shell/calculator-form'
import { CalculatorShell } from '@/components/calculators/shell/calculator-shell'
import { useCalculatorState } from '@/components/calculators/shell/use-calculator-state'
import { ResultStat, ResultGrid } from '@/components/calculators/result-stat'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BalanceLineChart } from '@/components/charts/balance-line-chart'
import { ComparisonBarChart } from '@/components/charts/comparison-bar-chart'

const DEFAULT_DEBTS: Debt[] = [
  { id: 'card-1', name: 'Credit card', balance: 4500, annualRate: 22, minimumPayment: 110 },
  { id: 'card-2', name: 'Store card', balance: 1200, annualRate: 27, minimumPayment: 35 },
  { id: 'auto-loan', name: 'Car loan', balance: 12000, annualRate: 6.5, minimumPayment: 280 },
]

/**
 * The debt list is not a scalar form field, so — unlike every other
 * calculator here — it is managed as its own repeatable editor rather than
 * through `config.inputs` (see the note in `config/calculators/debtPayoff.ts`).
 */
export function DebtPayoffCalculator() {
  const state = useCalculatorState(debtPayoffConfig)
  const { currency } = useCurrency()
  const [debts, setDebts] = React.useState<Debt[]>(DEFAULT_DEBTS)
  const v = state.values

  const comparison = React.useMemo(
    () => compareStrategies({ debts, extraMonthlyPayment: Number(v.extraMonthlyPayment) }),
    [debts, v.extraMonthlyPayment]
  )
  const strategy = v.strategy as PayoffStrategy
  const result = strategy === 'snowball' ? comparison.snowball : comparison.avalanche

  function updateDebt(id: string, patch: Partial<Debt>) {
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }

  function addDebt() {
    setDebts((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: `Debt ${prev.length + 1}`, balance: 1000, annualRate: 18, minimumPayment: 30 },
    ])
  }

  function removeDebt(id: string) {
    setDebts((prev) => prev.filter((d) => d.id !== id))
  }

  return (
    <CalculatorShell
      form={
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-muted">Your debts</h3>
              <Button type="button" variant="outline" size="sm" onClick={addDebt}>
                <Plus />
                Add debt
              </Button>
            </div>
            {debts.map((debt, index) => (
              <div key={debt.id} className="space-y-3 rounded-card border border-line p-3">
                <div className="flex items-center justify-between gap-2">
                  <Input
                    aria-label="Debt name"
                    value={debt.name}
                    onChange={(e) => updateDebt(debt.id, { name: e.target.value })}
                    className="h-8 border-none px-0 font-medium shadow-none focus-visible:ring-0"
                  />
                  {debts.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${debt.name}`}
                      onClick={() => removeDebt(debt.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor={`balance-${index}`} className="text-xs">Balance</Label>
                    <Input
                      id={`balance-${index}`}
                      type="text"
                      inputMode="decimal"
                      value={debt.balance}
                      onChange={(e) => updateDebt(debt.id, { balance: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`rate-${index}`} className="text-xs">APR %</Label>
                    <Input
                      id={`rate-${index}`}
                      type="text"
                      inputMode="decimal"
                      value={debt.annualRate}
                      onChange={(e) => updateDebt(debt.id, { annualRate: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`min-${index}`} className="text-xs">Minimum</Label>
                    <Input
                      id={`min-${index}`}
                      type="text"
                      inputMode="decimal"
                      value={debt.minimumPayment}
                      onChange={(e) => updateDebt(debt.id, { minimumPayment: Number(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <CalculatorForm config={debtPayoffConfig} state={state} />
        </div>
      }
      sticky={
        result.payoffPossible
          ? { label: 'Debt-free in', value: formatMonths(result.monthsToPayoff) }
          : { label: 'Payoff status', value: 'Increase your payment' }
      }
      results={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Your payoff plan ({strategy === 'snowball' ? 'snowball' : 'avalanche'})</CardTitle>
            </CardHeader>
            <CardContent>
              {result.payoffPossible ? (
                <>
                  <ResultStat primary label="Debt-free in" value={formatMonths(result.monthsToPayoff)} />
                  <div className="mt-4">
                    <ResultGrid>
                      <ResultStat label="Total interest paid" value={formatCurrency(result.totalInterest, currency)} />
                      <ResultStat label="Total paid" value={formatCurrency(result.totalPaid, currency)} />
                      <ResultStat label="Monthly payment" value={formatCurrency(result.monthlyPayment, currency)} />
                      <ResultStat label="Minimums only" value={formatCurrency(result.totalMinimumPayment, currency)} />
                    </ResultGrid>
                  </div>
                  {comparison.snowballExtraInterest > 0 && (
                    <p className="mt-4 text-sm text-ink-muted">
                      {strategy === 'snowball'
                        ? `Avalanche would save ${formatCurrency(comparison.snowballExtraInterest, currency)} in interest on these debts.`
                        : `Snowball would cost ${formatCurrency(comparison.snowballExtraInterest, currency)} more in interest, but clears your smallest debt sooner.`}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-loss">
                  Your total monthly payment does not cover the interest accruing on these debts, so
                  the balance will never reach zero. Increase your extra payment or reduce your rates
                  to see a payoff date.
                </p>
              )}
            </CardContent>
          </Card>

          {comparison.snowball.payoffPossible && comparison.avalanche.payoffPossible && (
            <Card>
              <CardContent className="pt-5">
                <ComparisonBarChart
                  title="Total interest by strategy"
                  currency={currency}
                  bars={[
                    { label: 'Avalanche', value: comparison.avalanche.totalInterest, color: 'var(--series-1)' },
                    { label: 'Snowball', value: comparison.snowball.totalInterest, color: 'var(--series-2)' },
                  ]}
                />
              </CardContent>
            </Card>
          )}

          {result.payoffPossible && result.timeline.length > 0 && (
            <Card>
              <CardContent className="pt-5">
                <BalanceLineChart
                  title="Total balance over time"
                  xLabel="Month"
                  currency={currency}
                  series={[
                    {
                      name: 'Total balance',
                      color: 'var(--series-1)',
                      points: result.timeline.map((t) => ({ x: t.month, y: t.totalBalance })),
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
