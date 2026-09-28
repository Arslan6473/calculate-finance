/**
 * US federal income tax and FICA parameters for tax year 2026.
 *
 * These are IRS inflation-adjusted figures for 2026 (Rev. Proc. 2025-32) and the
 * SSA 2026 wage base. They are isolated in this one file, with the tax year in
 * both the filename and the exported constant, so that the annual update is a
 * single reviewable diff rather than a hunt through the codebase.
 *
 * Scope, deliberately limited (see design spec D1): federal income tax, Social
 * Security and Medicare. State and local tax is supplied by the user as a rate
 * because maintaining fifty bracket tables to a verifiable standard is a
 * different project. The UI states this scope plainly.
 */

export const TAX_YEAR = 2026

export type FilingStatus = 'single' | 'married' | 'marriedSeparate' | 'headOfHousehold'

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  single: 'Single',
  married: 'Married filing jointly',
  marriedSeparate: 'Married filing separately',
  headOfHousehold: 'Head of household',
}

export interface TaxBracket {
  /** Rate as a decimal, e.g. 0.22 for the 22% bracket. */
  rate: number
  /** Taxable income at which this rate begins. */
  from: number
  /** Taxable income at which this rate ends. `Infinity` for the top bracket. */
  to: number
}

/** 2026 federal ordinary-income brackets, by filing status. */
export const FEDERAL_BRACKETS_2026: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { rate: 0.1, from: 0, to: 12_400 },
    { rate: 0.12, from: 12_400, to: 50_400 },
    { rate: 0.22, from: 50_400, to: 105_700 },
    { rate: 0.24, from: 105_700, to: 201_775 },
    { rate: 0.32, from: 201_775, to: 256_225 },
    { rate: 0.35, from: 256_225, to: 640_600 },
    { rate: 0.37, from: 640_600, to: Infinity },
  ],
  married: [
    { rate: 0.1, from: 0, to: 24_800 },
    { rate: 0.12, from: 24_800, to: 100_800 },
    { rate: 0.22, from: 100_800, to: 211_400 },
    { rate: 0.24, from: 211_400, to: 403_550 },
    { rate: 0.32, from: 403_550, to: 512_450 },
    { rate: 0.35, from: 512_450, to: 768_700 },
    { rate: 0.37, from: 768_700, to: Infinity },
  ],
  marriedSeparate: [
    { rate: 0.1, from: 0, to: 12_400 },
    { rate: 0.12, from: 12_400, to: 50_400 },
    { rate: 0.22, from: 50_400, to: 105_700 },
    { rate: 0.24, from: 105_700, to: 201_775 },
    { rate: 0.32, from: 201_775, to: 256_225 },
    { rate: 0.35, from: 256_225, to: 384_350 },
    { rate: 0.37, from: 384_350, to: Infinity },
  ],
  headOfHousehold: [
    { rate: 0.1, from: 0, to: 17_700 },
    { rate: 0.12, from: 17_700, to: 67_450 },
    { rate: 0.22, from: 67_450, to: 105_700 },
    { rate: 0.24, from: 105_700, to: 201_750 },
    { rate: 0.32, from: 201_750, to: 256_200 },
    { rate: 0.35, from: 256_200, to: 640_600 },
    { rate: 0.37, from: 640_600, to: Infinity },
  ],
}

/** 2026 standard deduction, by filing status. */
export const STANDARD_DEDUCTION_2026: Record<FilingStatus, number> = {
  single: 16_100,
  married: 32_200,
  marriedSeparate: 16_100,
  headOfHousehold: 24_150,
}

/** Social Security: 6.2% of wages up to the annual wage base. */
export const SOCIAL_SECURITY_RATE = 0.062
export const SOCIAL_SECURITY_WAGE_BASE_2026 = 184_500

/** Medicare: 1.45% on all wages, plus 0.9% above a filing-status threshold. */
export const MEDICARE_RATE = 0.0145
export const ADDITIONAL_MEDICARE_RATE = 0.009

/**
 * Additional Medicare Tax thresholds. Unlike the brackets these are fixed in
 * statute and are not inflation-adjusted.
 */
export const ADDITIONAL_MEDICARE_THRESHOLD: Record<FilingStatus, number> = {
  single: 200_000,
  married: 250_000,
  marriedSeparate: 125_000,
  headOfHousehold: 200_000,
}

/** How often a paycheck arrives, and how many arrive per year. */
export const PAY_FREQUENCIES = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
  quarterly: 4,
  annually: 1,
} as const

export type PayFrequency = keyof typeof PAY_FREQUENCIES

export const PAY_FREQUENCY_LABELS: Record<PayFrequency, string> = {
  weekly: 'Weekly (52 / year)',
  biweekly: 'Every two weeks (26 / year)',
  semimonthly: 'Twice a month (24 / year)',
  monthly: 'Monthly (12 / year)',
  quarterly: 'Quarterly (4 / year)',
  annually: 'Annually (1 / year)',
}
