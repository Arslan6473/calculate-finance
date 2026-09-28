/**
 * Currency definitions and formatters.
 *
 * This module is the ONLY place in the codebase that knows what a currency
 * symbol looks like. `lib/calculators/*` must never import from here — engines
 * operate on plain numbers so the same maths serves every currency (brief §9).
 */

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] as const

export type CurrencyCode = (typeof CURRENCIES)[number]

export const DEFAULT_CURRENCY: CurrencyCode = 'USD'

interface CurrencyMeta {
  code: CurrencyCode
  label: string
  symbol: string
  /** BCP 47 locale used for grouping and decimal separators. */
  locale: string
}

export const CURRENCY_META: Record<CurrencyCode, CurrencyMeta> = {
  USD: { code: 'USD', label: 'US Dollar', symbol: '$', locale: 'en-US' },
  EUR: { code: 'EUR', label: 'Euro', symbol: '€', locale: 'de-DE' },
  GBP: { code: 'GBP', label: 'British Pound', symbol: '£', locale: 'en-GB' },
  CAD: { code: 'CAD', label: 'Canadian Dollar', symbol: '$', locale: 'en-CA' },
  AUD: { code: 'AUD', label: 'Australian Dollar', symbol: '$', locale: 'en-AU' },
}

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === 'string' && (CURRENCIES as readonly string[]).includes(value)
}

/**
 * `Intl.NumberFormat` construction is not free and calculators re-render on
 * every keystroke, so formatters are memoised by their full option set.
 */
const formatterCache = new Map<string, Intl.NumberFormat>()

function getFormatter(key: string, build: () => Intl.NumberFormat): Intl.NumberFormat {
  const cached = formatterCache.get(key)
  if (cached) return cached
  const created = build()
  formatterCache.set(key, created)
  return created
}

/** Guards against `Intl` throwing on NaN/Infinity, which engines never emit but inputs can. */
function safeNumber(value: number): number {
  return Number.isFinite(value) ? value : 0
}

export interface CurrencyFormatOptions {
  /** Drop the decimal part. Defaults to true — cents are noise on most results. */
  whole?: boolean
  /** Render 1_250_000 as "$1.25M". Useful in chart axes and tight cards. */
  compact?: boolean
}

export function formatCurrency(
  value: number,
  currency: CurrencyCode = DEFAULT_CURRENCY,
  options: CurrencyFormatOptions = {}
): string {
  const { whole = true, compact = false } = options
  const meta = CURRENCY_META[currency] ?? CURRENCY_META[DEFAULT_CURRENCY]
  const key = `cur:${currency}:${whole}:${compact}`

  const formatter = getFormatter(key, () =>
    new Intl.NumberFormat(meta.locale, {
      style: 'currency',
      currency,
      notation: compact ? 'compact' : 'standard',
      maximumFractionDigits: compact ? 1 : whole ? 0 : 2,
      minimumFractionDigits: compact ? 0 : whole ? 0 : 2,
    })
  )

  return formatter.format(safeNumber(value))
}

/** Currency without the symbol — for table cells where the column header carries the unit. */
export function formatAmount(value: number, currency: CurrencyCode = DEFAULT_CURRENCY): string {
  const meta = CURRENCY_META[currency] ?? CURRENCY_META[DEFAULT_CURRENCY]
  const formatter = getFormatter(`amt:${currency}`, () =>
    new Intl.NumberFormat(meta.locale, { maximumFractionDigits: 0 })
  )
  return formatter.format(safeNumber(value))
}

export function currencySymbol(currency: CurrencyCode = DEFAULT_CURRENCY): string {
  return (CURRENCY_META[currency] ?? CURRENCY_META[DEFAULT_CURRENCY]).symbol
}
