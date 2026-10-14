import { money, num, round2 } from './guards'

/** Hours in a week — the ceiling on regular plus overtime hours combined. */
const HOURS_PER_WEEK = 168
const WEEKS_PER_YEAR = 52

export interface OvertimeInput {
  /** Regular (straight-time) hourly wage. */
  hourlyRate: number
  /** Hours paid at the regular rate each week. FLSA threshold is 40. */
  regularHours: number
  /** Hours paid at the overtime rate each week. */
  overtimeHours: number
  /** Overtime multiplier: 1.5 for time-and-a-half, 2 for double time. */
  multiplier: number
  /** Weeks per year this schedule is worked, for the annual figures. */
  weeksPerYear?: number
}

export interface OvertimeResult {
  overtimeRate: number
  regularPay: number
  overtimePay: number
  totalWeekly: number

  annualRegularPay: number
  annualOvertimePay: number
  annualTotal: number

  /** Total weekly pay divided by total hours worked. */
  effectiveHourlyRate: number
  /** Share of total pay that comes from overtime. */
  overtimeShare: number
  isValid: boolean
}

/**
 * Weekly and annualised gross pay with overtime.
 *
 * Overtime hours are taken as entered — the engine does not reclassify
 * regular hours above 40 as overtime, because the threshold and any daily
 * rules depend on jurisdiction. The UI explains the federal FLSA default.
 */
export function calculateOvertime(input: OvertimeInput): OvertimeResult {
  const hourlyRate = money(input.hourlyRate)
  const regularHours = Math.min(Math.max(num(input.regularHours), 0), HOURS_PER_WEEK)
  // Overtime can only fill whatever is left of the week after regular hours.
  const overtimeHours = Math.min(Math.max(num(input.overtimeHours), 0), HOURS_PER_WEEK - regularHours)
  const multiplier = Math.min(Math.max(num(input.multiplier) || 1.5, 1), 10)
  const weeksPerYear = Math.min(Math.max(num(input.weeksPerYear ?? WEEKS_PER_YEAR), 0), WEEKS_PER_YEAR)

  const overtimeRate = hourlyRate * multiplier
  const regularPay = hourlyRate * regularHours
  const overtimePay = overtimeRate * overtimeHours
  const totalWeekly = regularPay + overtimePay
  const totalHours = regularHours + overtimeHours

  return {
    overtimeRate: round2(overtimeRate),
    regularPay: round2(regularPay),
    overtimePay: round2(overtimePay),
    totalWeekly: round2(totalWeekly),

    annualRegularPay: round2(regularPay * weeksPerYear),
    annualOvertimePay: round2(overtimePay * weeksPerYear),
    annualTotal: round2(totalWeekly * weeksPerYear),

    effectiveHourlyRate: totalHours > 0 ? round2(totalWeekly / totalHours) : 0,
    overtimeShare: totalWeekly > 0 ? round2((overtimePay / totalWeekly) * 100) : 0,
    isValid: totalWeekly > 0,
  }
}
