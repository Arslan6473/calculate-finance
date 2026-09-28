/** Percentage, duration and plain-number formatters. Complements `currency.ts`. */

function safe(value: number): number {
  return Number.isFinite(value) ? value : 0
}

/**
 * Formats a percentage. Takes the human-facing number, not a ratio:
 * `formatPercent(6.5)` → "6.5%".
 */
export function formatPercent(value: number, fractionDigits = 2): string {
  const rounded = Number(safe(value).toFixed(fractionDigits))
  // Trim "6.50%" to "6.5%" but leave "6.25%" intact.
  return `${rounded.toLocaleString('en-US', { maximumFractionDigits: fractionDigits })}%`
}

export function formatNumber(value: number, fractionDigits = 0): string {
  return safe(value).toLocaleString('en-US', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: 0,
  })
}

/** 42 → "3 years 6 months"; 12 → "1 year"; 0 → "0 months". */
export function formatMonths(totalMonths: number): string {
  const months = Math.max(0, Math.round(safe(totalMonths)))
  const years = Math.floor(months / 12)
  const remainder = months % 12

  const parts: string[] = []
  if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`)
  if (remainder > 0) parts.push(`${remainder} ${remainder === 1 ? 'month' : 'months'}`)
  if (parts.length === 0) return '0 months'
  return parts.join(' ')
}

/**
 * Converts a month offset from today into a calendar label, e.g. "March 2031".
 * Used for payoff dates. `from` is injectable so tests are deterministic.
 */
export function formatPayoffDate(monthsFromNow: number, from: Date = new Date()): string {
  const months = Math.max(0, Math.round(safe(monthsFromNow)))
  const date = new Date(from.getFullYear(), from.getMonth() + months, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/** Clamps a value into a range, mapping non-finite input to the minimum. */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(Math.max(value, min), max)
}
