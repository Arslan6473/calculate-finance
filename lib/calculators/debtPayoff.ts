import { MAX_PERIODS, money, rate, round2 } from './guards'

export type PayoffStrategy = 'snowball' | 'avalanche'

export const PAYOFF_STRATEGY_LABELS: Record<PayoffStrategy, string> = {
  snowball: 'Snowball (smallest balance first)',
  avalanche: 'Avalanche (highest interest first)',
}

export interface Debt {
  id: string
  name: string
  balance: number
  /** Annual percentage rate, e.g. 22.9. */
  annualRate: number
  /** The minimum the lender requires each month. */
  minimumPayment: number
}

export interface DebtPayoffInput {
  debts: Debt[]
  /** Money available each month above the sum of the minimums. */
  extraMonthlyPayment?: number
  strategy: PayoffStrategy
}

export interface DebtPayoffMonth {
  month: number
  /** Total balance across all debts after this month's payments. */
  totalBalance: number
  totalPaid: number
  totalInterestPaid: number
}

export interface DebtSummary {
  id: string
  name: string
  originalBalance: number
  /** Month this debt hit zero. */
  payoffMonth: number
  totalInterest: number
  totalPaid: number
}

export interface DebtPayoffResult {
  /** False when the payments cannot cover interest — the debt never clears. */
  payoffPossible: boolean
  monthsToPayoff: number
  totalPaid: number
  totalInterest: number
  totalMinimumPayment: number
  /** Minimums plus any extra — what the user pays each month. */
  monthlyPayment: number
  /** Per-debt outcomes, ordered by payoff date. */
  debtSummaries: DebtSummary[]
  timeline: DebtPayoffMonth[]
  isValid: boolean
}

/**
 * Orders debts according to the chosen strategy.
 *
 * Avalanche is mathematically optimal — paying the highest rate first always
 * minimises total interest. Snowball clears the smallest balance first, which
 * costs more but produces a win sooner. Both are offered because the behavioural
 * argument for snowball is real, and the calculator's job is to quantify the
 * trade-off rather than pick for the user.
 */
function orderDebts(debts: Debt[], strategy: PayoffStrategy): Debt[] {
  const sorted = [...debts]
  if (strategy === 'avalanche') {
    sorted.sort((a, b) => b.annualRate - a.annualRate || a.balance - b.balance)
  } else {
    sorted.sort((a, b) => a.balance - b.balance || b.annualRate - a.annualRate)
  }
  return sorted
}

/**
 * Simulates paying down several debts month by month.
 *
 * The mechanic that makes snowball and avalanche work is the rollover: when a
 * debt clears, its payment is added to the attack on the next target rather than
 * being absorbed into spending. That compounding of freed-up payment is why both
 * strategies beat paying minimums, and it is only visible in a simulation.
 */
export function calculateDebtPayoff(input: DebtPayoffInput): DebtPayoffResult {
  const extra = money(input.extraMonthlyPayment)

  const debts = (input.debts ?? [])
    .map((debt, index) => ({
      id: debt.id || `debt-${index}`,
      name: debt.name?.trim() || `Debt ${index + 1}`,
      balance: money(debt.balance),
      annualRate: rate(debt.annualRate),
      minimumPayment: money(debt.minimumPayment),
    }))
    .filter((debt) => debt.balance > 0)

  const totalMinimumPayment = round2(debts.reduce((sum, d) => sum + d.minimumPayment, 0))

  const empty: DebtPayoffResult = {
    payoffPossible: false,
    monthsToPayoff: 0,
    totalPaid: 0,
    totalInterest: 0,
    totalMinimumPayment,
    monthlyPayment: round2(totalMinimumPayment + extra),
    debtSummaries: [],
    timeline: [],
    isValid: false,
  }
  if (debts.length === 0) return empty

  const ordered = orderDebts(debts, input.strategy)

  // Working state, keyed by id so the payoff order can differ from input order.
  const state = new Map(
    ordered.map((debt) => [
      debt.id,
      {
        ...debt,
        remaining: debt.balance,
        interestPaid: 0,
        paid: 0,
        payoffMonth: 0,
      },
    ])
  )

  const timeline: DebtPayoffMonth[] = []
  let totalInterestPaid = 0
  let totalPaidOverall = 0
  let month = 0

  /*
    Feasibility check. If the total available payment does not exceed the total
    monthly interest at the current balances, the debt grows every month and no
    finite schedule exists. Reporting that plainly is far more useful than
    iterating to a cap and presenting a wrong number.
  */
  const monthlyInterestAtStart = debts.reduce(
    (sum, d) => sum + (d.balance * d.annualRate) / 100 / 12,
    0
  )
  const availablePayment = totalMinimumPayment + extra
  if (availablePayment <= monthlyInterestAtStart + 0.005) {
    return { ...empty, isValid: true, payoffPossible: false }
  }

  while (month < MAX_PERIODS) {
    month++

    const active = ordered.map((d) => state.get(d.id)!).filter((d) => d.remaining > 0)
    if (active.length === 0) break

    // Accrue this month's interest on every active debt first.
    for (const debt of active) {
      const monthlyRate = debt.annualRate / 100 / 12
      const interest = debt.remaining * monthlyRate
      debt.remaining += interest
      debt.interestPaid += interest
      totalInterestPaid += interest
    }

    // The full budget is the sum of ALL original minimums plus the extra. Freed-up
    // minimums from cleared debts stay in the budget — that is the rollover.
    let budget = totalMinimumPayment + extra
    let monthPaid = 0

    // Pay the required minimum on every debt except the current target.
    const target = active[0]
    for (const debt of active) {
      if (debt === target) continue
      const payment = Math.min(debt.minimumPayment, debt.remaining, budget)
      if (payment <= 0) continue
      debt.remaining -= payment
      debt.paid += payment
      budget -= payment
      monthPaid += payment
      if (debt.remaining < 0.005) {
        debt.remaining = 0
        debt.payoffMonth = month
      }
    }

    // Everything left attacks the target.
    if (budget > 0 && target.remaining > 0) {
      const payment = Math.min(budget, target.remaining)
      target.remaining -= payment
      target.paid += payment
      budget -= payment
      monthPaid += payment
      if (target.remaining < 0.005) {
        target.remaining = 0
        target.payoffMonth = month
      }
    }

    totalPaidOverall += monthPaid

    const totalBalance = ordered.reduce((sum, d) => sum + state.get(d.id)!.remaining, 0)

    timeline.push({
      month,
      totalBalance: round2(Math.max(0, totalBalance)),
      totalPaid: round2(totalPaidOverall),
      totalInterestPaid: round2(totalInterestPaid),
    })

    if (totalBalance < 0.005) break
  }

  const allCleared = ordered.every((d) => state.get(d.id)!.remaining === 0)

  const debtSummaries: DebtSummary[] = ordered
    .map((d) => {
      const s = state.get(d.id)!
      return {
        id: s.id,
        name: s.name,
        originalBalance: round2(s.balance),
        payoffMonth: s.payoffMonth,
        totalInterest: round2(s.interestPaid),
        totalPaid: round2(s.paid),
      }
    })
    .sort((a, b) => a.payoffMonth - b.payoffMonth)

  return {
    payoffPossible: allCleared,
    monthsToPayoff: allCleared ? month : 0,
    totalPaid: round2(totalPaidOverall),
    totalInterest: round2(totalInterestPaid),
    totalMinimumPayment,
    monthlyPayment: round2(totalMinimumPayment + extra),
    debtSummaries,
    timeline,
    isValid: true,
  }
}

/**
 * Runs both strategies on the same debts so the UI can state the cost of
 * choosing snowball over avalanche — the comparison is the actual insight.
 */
export function compareStrategies(input: Omit<DebtPayoffInput, 'strategy'>): {
  snowball: DebtPayoffResult
  avalanche: DebtPayoffResult
  /** Extra interest paid by choosing snowball. Zero or positive. */
  snowballExtraInterest: number
  /** Extra months taken by snowball. Can be zero. */
  snowballExtraMonths: number
} {
  const snowball = calculateDebtPayoff({ ...input, strategy: 'snowball' })
  const avalanche = calculateDebtPayoff({ ...input, strategy: 'avalanche' })

  const bothWorked = snowball.payoffPossible && avalanche.payoffPossible

  return {
    snowball,
    avalanche,
    snowballExtraInterest: bothWorked
      ? round2(Math.max(0, snowball.totalInterest - avalanche.totalInterest))
      : 0,
    snowballExtraMonths: bothWorked
      ? Math.max(0, snowball.monthsToPayoff - avalanche.monthsToPayoff)
      : 0,
  }
}
