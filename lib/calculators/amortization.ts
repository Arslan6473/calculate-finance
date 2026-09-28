import { MAX_PERIODS, annuityPayment, round2 } from './guards'

/** One row of a monthly amortisation schedule. */
export interface AmortizationRow {
  /** 1-based payment number. */
  period: number
  /** Calendar month index, 1-based, for yearly grouping. */
  year: number
  payment: number
  principal: number
  interest: number
  /** Balance remaining *after* this payment. */
  balance: number
  /** Cumulative interest paid through this payment. */
  cumulativeInterest: number
}

export interface YearlyAmortizationRow {
  year: number
  payment: number
  principal: number
  interest: number
  /** Balance at the end of the year. */
  balance: number
  cumulativeInterest: number
}

export interface AmortizationSchedule {
  rows: AmortizationRow[]
  monthlyPayment: number
  totalInterest: number
  totalPaid: number
  /** Number of payments actually required — lower than the term when overpaying. */
  actualPeriods: number
}

export interface AmortizationInput {
  principal: number
  /** Annual percentage rate, e.g. 6.5. */
  annualRate: number
  /** Scheduled number of monthly payments. */
  totalPeriods: number
  /** Optional voluntary extra principal applied every month. */
  extraMonthlyPayment?: number
}

/**
 * Builds a full monthly amortisation schedule.
 *
 * Interest each month is `balance × monthlyRate`; whatever the payment does not
 * spend on interest reduces the balance. The final payment is trimmed to the
 * exact outstanding balance so the schedule ends at precisely zero rather than
 * at accumulated floating-point dust.
 */
export function buildAmortizationSchedule(input: AmortizationInput): AmortizationSchedule {
  const principal = Math.max(0, input.principal)
  const totalPeriods = Math.min(Math.max(Math.floor(input.totalPeriods), 0), MAX_PERIODS)
  const monthlyRate = Math.max(0, input.annualRate) / 100 / 12
  const extra = Math.max(0, input.extraMonthlyPayment ?? 0)

  const scheduledPayment = annuityPayment(principal, monthlyRate, totalPeriods)

  const empty: AmortizationSchedule = {
    rows: [],
    monthlyPayment: round2(scheduledPayment),
    totalInterest: 0,
    totalPaid: 0,
    actualPeriods: 0,
  }
  if (principal <= 0 || totalPeriods <= 0) return empty

  const monthlyPayment = scheduledPayment + extra

  // With no extra payment the annuity formula guarantees termination. With a
  // zero rate it also terminates. Only a pathological rate could make the
  // payment fail to cover interest, and annuityPayment() already floors at
  // interest-only, so cap iterations at the scheduled term either way.
  const rows: AmortizationRow[] = []
  let balance = principal
  let cumulativeInterest = 0

  for (let period = 1; period <= totalPeriods && balance > 0; period++) {
    const interest = balance * monthlyRate
    let principalPart = monthlyPayment - interest

    // Guard: if the payment cannot cover interest the loan never amortises.
    // annuityPayment() prevents this for generated payments, but an extra
    // payment of zero on a hand-supplied payment could still hit it.
    if (principalPart <= 0) break

    if (principalPart > balance) principalPart = balance

    const actualPayment = principalPart + interest
    balance = balance - principalPart
    cumulativeInterest += interest

    // Snap sub-cent residue to zero so the last row reads exactly 0.
    if (balance < 0.005) balance = 0

    rows.push({
      period,
      year: Math.ceil(period / 12),
      payment: round2(actualPayment),
      principal: round2(principalPart),
      interest: round2(interest),
      balance: round2(balance),
      cumulativeInterest: round2(cumulativeInterest),
    })
  }

  const totalInterest = round2(cumulativeInterest)
  const totalPaid = round2(rows.reduce((sum, row) => sum + row.payment, 0))

  return {
    rows,
    monthlyPayment: round2(monthlyPayment),
    totalInterest,
    totalPaid,
    actualPeriods: rows.length,
  }
}

/** Collapses a monthly schedule into calendar-year totals for the yearly view. */
export function toYearlySchedule(rows: AmortizationRow[]): YearlyAmortizationRow[] {
  const byYear = new Map<number, YearlyAmortizationRow>()

  for (const row of rows) {
    const existing = byYear.get(row.year)
    if (existing) {
      existing.payment = round2(existing.payment + row.payment)
      existing.principal = round2(existing.principal + row.principal)
      existing.interest = round2(existing.interest + row.interest)
      existing.balance = row.balance
      existing.cumulativeInterest = row.cumulativeInterest
    } else {
      byYear.set(row.year, {
        year: row.year,
        payment: row.payment,
        principal: row.principal,
        interest: row.interest,
        balance: row.balance,
        cumulativeInterest: row.cumulativeInterest,
      })
    }
  }

  return Array.from(byYear.values())
}
