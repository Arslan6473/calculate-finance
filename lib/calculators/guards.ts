/**
 * Shared numeric guards for every calculation engine.
 *
 * Engines are *total*: they return a result for all inputs rather than throwing,
 * because they run on every keystroke behind a live form. Rather than each engine
 * inventing its own defence, they all normalise inputs through these helpers.
 *
 * Ceilings exist so that a pasted or fat-fingered value cannot make a schedule
 * generator allocate an unbounded array.
 */

/** Largest monetary value any engine will accept — one trillion. */
export const MAX_MONEY = 1e12

/** Largest annual percentage rate any engine will accept. */
export const MAX_RATE = 1e4

/** Longest schedule any engine will generate: 50 years of monthly payments. */
export const MAX_PERIODS = 600

/** Coerces anything to a finite number. `''`, `null`, `NaN`, `Infinity` → 0. */
export function num(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return 0
    // Tolerate values pasted with grouping separators or a currency symbol.
    const parsed = Number(trimmed.replace(/[,\s$€£]/g, ''))
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

/** A non-negative amount of money, capped at {@link MAX_MONEY}. */
export function money(value: unknown): number {
  return Math.min(Math.max(num(value), 0), MAX_MONEY)
}

/**
 * A signed amount of money, capped at ±{@link MAX_MONEY}. For inputs where a
 * negative genuinely means something, such as an investment that lost value.
 */
export function signedMoney(value: unknown): number {
  const n = num(value)
  return Math.min(Math.max(n, -MAX_MONEY), MAX_MONEY)
}

/** A non-negative annual percentage rate, capped at {@link MAX_RATE}. */
export function rate(value: unknown): number {
  return Math.min(Math.max(num(value), 0), MAX_RATE)
}

/** A signed percentage rate — inflation and returns can be negative. */
export function signedRate(value: unknown): number {
  const n = num(value)
  return Math.min(Math.max(n, -MAX_RATE), MAX_RATE)
}

/** A whole number of periods in `[0, MAX_PERIODS]`. */
export function periods(value: unknown): number {
  return Math.min(Math.max(Math.floor(num(value)), 0), MAX_PERIODS)
}

/** A whole number of years in `[0, 50]`. */
export function years(value: unknown): number {
  return Math.min(Math.max(Math.floor(num(value)), 0), 50)
}

/** An age in `[0, 120]`. */
export function age(value: unknown): number {
  return Math.min(Math.max(Math.floor(num(value)), 0), 120)
}

/** Rounds to cents. Used at result boundaries to absorb float drift. */
export function round2(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/** Rounds to whole units. */
export function round0(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round(value)
}

/**
 * Converts an annual percentage rate into a per-period decimal rate.
 * `periodicRate(6, 12)` → 0.005
 */
export function periodicRate(annualPercent: number, periodsPerYear: number): number {
  if (periodsPerYear <= 0) return 0
  return annualPercent / 100 / periodsPerYear
}

/**
 * The standard amortising-payment (annuity) formula.
 *
 *     P = L · i / (1 − (1 + i)^−n)
 *
 * Zero rate is an explicit branch: the closed form divides by zero there, but
 * the correct answer is simply the principal spread evenly across the term.
 */
export function annuityPayment(
  principal: number,
  ratePerPeriod: number,
  totalPeriods: number
): number {
  if (totalPeriods <= 0 || principal <= 0) return 0
  if (ratePerPeriod <= 0) return principal / totalPeriods

  const growth = Math.pow(1 + ratePerPeriod, totalPeriods)
  if (!Number.isFinite(growth)) {
    // Rate × term large enough to overflow: the payment converges on interest-only.
    return principal * ratePerPeriod
  }
  const denominator = 1 - 1 / growth
  if (denominator <= 0) return principal * ratePerPeriod
  return (principal * ratePerPeriod) / denominator
}

/**
 * Future value of a present sum plus a recurring contribution made at the end
 * of each period.
 *
 *     FV = PV·(1+i)^n + PMT·((1+i)^n − 1)/i
 */
export function futureValue(
  present: number,
  contributionPerPeriod: number,
  ratePerPeriod: number,
  totalPeriods: number
): number {
  if (totalPeriods <= 0) return present
  if (ratePerPeriod === 0) return present + contributionPerPeriod * totalPeriods

  const growth = Math.pow(1 + ratePerPeriod, totalPeriods)
  if (!Number.isFinite(growth)) return MAX_MONEY

  const value = present * growth + contributionPerPeriod * ((growth - 1) / ratePerPeriod)
  return Number.isFinite(value) ? value : MAX_MONEY
}
