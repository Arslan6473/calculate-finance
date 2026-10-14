import { money, num, round2 } from './guards'
import { annualToHourly, hourlyToAnnual } from './salary'

/** Standard full-time assumptions, overridable by the caller. */
const DEFAULT_HOURS_PER_WEEK = 40
const DEFAULT_DAYS_PER_WEEK = 5
const WEEKS_PER_YEAR = 52

export type HourlyToSalaryDirection = 'hourly' | 'annual'

export interface HourlyToSalaryInput {
  /** Which figure the user knows — the other is derived from it. */
  direction: HourlyToSalaryDirection
  /** Gross hourly wage. Used when `direction` is `hourly`. */
  hourlyRate: number
  /** Gross annual salary. Used when `direction` is `annual`. */
  annualSalary: number
  hoursPerWeek?: number
  /** Working days per week, for the daily figure only. */
  daysPerWeek?: number
  /** Unpaid weeks off per year. Reduces the paid weeks the conversion uses. */
  unpaidWeeksOff?: number
}

export interface HourlyToSalaryResult {
  annual: number
  /** Annual pay spread evenly across twelve months. */
  monthly: number
  /** Pay for two working weeks. */
  biweekly: number
  /** Pay for one working week. */
  weekly: number
  /** Pay for one working day. */
  daily: number
  hourly: number

  paidWeeks: number
  hoursPerYear: number
  isValid: boolean
}

/**
 * Converts gross pay between an hourly wage and an annual salary, then breaks
 * it down into the common pay periods.
 *
 * Weekly, biweekly and daily figures describe a *working* period, so they
 * don't shrink when unpaid weeks off are added — the annual figure does. The
 * monthly figure is the annual total averaged over twelve months. With no
 * unpaid weeks the two views agree exactly (weekly × 52 = annual).
 *
 * Gross pay only: tax is the salary calculator's job.
 */
export function calculateHourlyToSalary(input: HourlyToSalaryInput): HourlyToSalaryResult {
  const hoursPerWeek = Math.min(Math.max(num(input.hoursPerWeek ?? DEFAULT_HOURS_PER_WEEK), 0), 168)
  const daysPerWeek = Math.min(Math.max(num(input.daysPerWeek ?? DEFAULT_DAYS_PER_WEEK), 0), 7)
  const unpaidWeeks = Math.min(Math.max(num(input.unpaidWeeksOff), 0), WEEKS_PER_YEAR)
  const paidWeeks = WEEKS_PER_YEAR - unpaidWeeks
  const hoursPerYear = hoursPerWeek * paidWeeks

  // Keep an unrounded hourly rate for the derived periods so that, on the
  // annual path, weekly × paid weeks reproduces the salary to the cent.
  let annual: number
  let exactHourly: number
  if (input.direction === 'annual') {
    annual = money(input.annualSalary)
    exactHourly = hoursPerYear > 0 ? annual / hoursPerYear : 0
  } else {
    exactHourly = money(input.hourlyRate)
    annual = hourlyToAnnual(exactHourly, hoursPerWeek, paidWeeks)
  }

  const weekly = exactHourly * hoursPerWeek

  return {
    annual: round2(annual),
    monthly: round2(annual / 12),
    biweekly: round2(weekly * 2),
    weekly: round2(weekly),
    daily: daysPerWeek > 0 ? round2(weekly / daysPerWeek) : 0,
    hourly:
      input.direction === 'annual'
        ? annualToHourly(annual, hoursPerWeek, paidWeeks)
        : round2(exactHourly),

    paidWeeks,
    hoursPerYear,
    isValid: annual > 0 && hoursPerYear > 0,
  }
}
