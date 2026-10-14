import { futureValue, money, rate, round2, years } from './guards'
import { COMPOUND_FREQUENCIES, type CompoundFrequency } from './compoundInterest'

export type ContributionTiming = 'end' | 'start'

export interface SavingsGoalInput {
  /** The target balance. */
  goalAmount: number
  /** What is already saved toward the goal. */
  currentSavings?: number
  /** Whole years until the goal date. */
  termYears: number
  /** Expected annual interest or return as a percentage, e.g. 5. */
  annualRate: number
  compoundFrequency?: CompoundFrequency
  /** Deposit at the start of each month rather than the end. */
  contributionTiming?: ContributionTiming
}

export interface SavingsGoalYear {
  year: number
  /** Balance at the end of this year. */
  balance: number
  /** Cumulative deposits including the starting savings. */
  totalContributed: number
  /** Cumulative interest earned. */
  totalInterest: number
}

export interface SavingsGoalResult {
  /** Monthly deposit needed to reach the goal on time. Zero when no deposits are needed. */
  monthlyContribution: number
  /** Starting savings plus every monthly deposit. */
  totalContributed: number
  /** Interest earned over the term. */
  interestEarned: number
  /** Balance at the goal date with the required deposits. */
  projectedBalance: number
  /** What the current savings alone grow to by the goal date. */
  currentSavingsFutureValue: number
  /** Current savings already meet or exceed the goal. */
  goalAlreadyReached: boolean
  /** Current savings will grow to the goal without any further deposits. */
  onTrackWithoutContributions: boolean
  yearly: SavingsGoalYear[]
  isValid: boolean
}

/**
 * The effective monthly rate equivalent to an annual rate compounded `n` times
 * a year: (1 + r/n)^(n/12) − 1. Deposits are monthly, so this lets one
 * closed-form solve cover every compounding frequency exactly.
 */
function monthlyRateFor(annualPercent: number, compoundsPerYear: number): number {
  if (annualPercent === 0) return 0
  return Math.pow(1 + annualPercent / 100 / compoundsPerYear, compoundsPerYear / 12) - 1
}

/**
 * The monthly deposit needed to reach a savings goal.
 *
 * Solves the future-value equation for the payment:
 *
 *     PMT = (Goal − PV·(1+i)^N) / ( ((1+i)^N − 1)/i · (1+i if deposits are at the start) )
 *
 * The annuity factor comes from the shared `futureValue` helper (FV of a
 * one-unit payment), which already handles the zero-rate case — there the
 * answer is simply the shortfall spread evenly over the months.
 */
export function calculateSavingsGoal(input: SavingsGoalInput): SavingsGoalResult {
  const goalAmount = money(input.goalAmount)
  const currentSavings = money(input.currentSavings)
  const termYears = years(input.termYears)
  const annualRate = rate(input.annualRate)
  const compoundsPerYear = COMPOUND_FREQUENCIES[input.compoundFrequency ?? 'monthly'] ?? 12
  const atStart = input.contributionTiming === 'start'

  const months = termYears * 12
  const i = monthlyRateFor(annualRate, compoundsPerYear)

  const empty: SavingsGoalResult = {
    monthlyContribution: 0,
    totalContributed: round2(currentSavings),
    interestEarned: 0,
    projectedBalance: round2(currentSavings),
    currentSavingsFutureValue: round2(currentSavings),
    goalAlreadyReached: goalAmount > 0 && currentSavings >= goalAmount,
    onTrackWithoutContributions: false,
    yearly: [],
    isValid: false,
  }
  if (goalAmount <= 0 || months <= 0) return empty

  const currentSavingsFutureValue = futureValue(currentSavings, 0, i, months)
  const goalAlreadyReached = currentSavings >= goalAmount
  const shortfall = goalAmount - currentSavingsFutureValue

  let monthlyContribution = 0
  if (shortfall > 0) {
    const annuityFactor = futureValue(0, 1, i, months) * (atStart ? 1 + i : 1)
    monthlyContribution = annuityFactor > 0 ? shortfall / annuityFactor : 0
  }

  // Walk the schedule month by month for the chart, using the same effective
  // monthly rate the solve used so the final balance lands on the goal.
  let balance = currentSavings
  let totalContributed = currentSavings
  const yearly: SavingsGoalYear[] = []
  for (let year = 1; year <= termYears; year++) {
    for (let m = 0; m < 12; m++) {
      if (atStart) balance += monthlyContribution
      balance += balance * i
      if (!atStart) balance += monthlyContribution
      totalContributed += monthlyContribution
    }
    yearly.push({
      year,
      balance: round2(balance),
      totalContributed: round2(totalContributed),
      totalInterest: round2(balance - totalContributed),
    })
  }

  return {
    monthlyContribution: round2(monthlyContribution),
    totalContributed: round2(totalContributed),
    interestEarned: round2(balance - totalContributed),
    projectedBalance: round2(balance),
    currentSavingsFutureValue: round2(currentSavingsFutureValue),
    goalAlreadyReached,
    onTrackWithoutContributions: !goalAlreadyReached && shortfall <= 0,
    yearly,
    isValid: true,
  }
}
