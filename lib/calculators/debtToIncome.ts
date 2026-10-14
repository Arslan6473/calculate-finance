import { money, round2 } from './guards'

export interface DebtToIncomeInput {
  /** Gross (pre-tax) monthly income from your main job. */
  grossMonthlyIncome: number
  /** Other regular gross monthly income: side work, alimony, rental income. */
  otherMonthlyIncome?: number
  /** Rent or full mortgage payment (principal, interest, tax, insurance, HOA). */
  housingPayment?: number
  carLoans?: number
  studentLoans?: number
  /** Minimum required payments, not balances. */
  creditCardMinimums?: number
  otherDebts?: number
}

/**
 * Where a back-end ratio sits against two widely quoted reference points:
 * 36% (the traditional conventional-loan guideline) and 43% (the ratio long
 * associated with Qualified Mortgage rules). Lenders vary; these are bands, not
 * approval decisions.
 */
export type DtiBand = 'within-36' | 'between-36-43' | 'above-43'

export interface DebtToIncomeResult {
  totalMonthlyIncome: number
  totalMonthlyDebt: number
  /** Housing payment ÷ income, as a percentage. */
  frontEndDti: number
  /** All debt payments including housing ÷ income, as a percentage. */
  backEndDti: number
  band: DtiBand
  /** Total monthly debt payments that equal exactly 36% of income. */
  debtAt36: number
  /** Monthly debt you could add before reaching 36%. Zero when already above. */
  roomTo36: number
  /** Monthly debt you would need to cut to get down to 36%. Zero when already at or below. */
  cutTo36: number
  isValid: boolean
}

export const CONVENTIONAL_DTI_GUIDELINE = 36
export const QM_DTI_REFERENCE = 43

/**
 * Debt-to-income ratios as a mortgage lender computes them: required monthly
 * debt payments divided by gross monthly income. The front-end ratio counts
 * housing alone; the back-end ratio counts housing plus every other debt.
 */
export function calculateDebtToIncome(input: DebtToIncomeInput): DebtToIncomeResult {
  const totalMonthlyIncome = round2(money(input.grossMonthlyIncome) + money(input.otherMonthlyIncome))
  const housing = money(input.housingPayment)
  const totalMonthlyDebt = round2(
    housing +
      money(input.carLoans) +
      money(input.studentLoans) +
      money(input.creditCardMinimums) +
      money(input.otherDebts)
  )

  const isValid = totalMonthlyIncome > 0
  const frontEndDti = isValid ? round2((housing / totalMonthlyIncome) * 100) : 0
  const backEndDti = isValid ? round2((totalMonthlyDebt / totalMonthlyIncome) * 100) : 0

  const band: DtiBand =
    backEndDti <= CONVENTIONAL_DTI_GUIDELINE
      ? 'within-36'
      : backEndDti <= QM_DTI_REFERENCE
        ? 'between-36-43'
        : 'above-43'

  const debtAt36 = round2(totalMonthlyIncome * (CONVENTIONAL_DTI_GUIDELINE / 100))
  const gap = round2(debtAt36 - totalMonthlyDebt)

  return {
    totalMonthlyIncome,
    totalMonthlyDebt,
    frontEndDti,
    backEndDti,
    band,
    debtAt36,
    roomTo36: isValid ? Math.max(0, gap) : 0,
    cutTo36: isValid ? Math.max(0, -gap) : 0,
    isValid,
  }
}
