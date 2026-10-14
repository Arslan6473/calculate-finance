import { money, rate, round2 } from './guards'

export type IncomeFrequency = 'annual' | 'monthly'

export interface RentAffordabilityInput {
  /** Gross (pre-tax) income, per `incomeFrequency`. */
  grossIncome: number
  incomeFrequency?: IncomeFrequency
  /** Minimum monthly payments on existing debts. */
  monthlyDebts?: number
  /** Share of gross monthly income you are willing to spend on rent. Default 30. */
  rentSharePercent?: number
  /** Take-home pay as a percentage of gross, used for the 50/30/20 view. Default 75. */
  takeHomePercent?: number
  /** Other monthly essentials — groceries, utilities, transport, insurance. */
  monthlyEssentials?: number
}

export type RentRule = 'incomeShare' | 'needsBudget' | 'incomeMultiple' | 'debtToIncome'

export interface RentAffordabilityResult {
  grossMonthlyIncome: number
  takeHomeMonthlyIncome: number

  /** Gross monthly income × your target rent share (the "30% rule" by default). */
  byIncomeShare: number
  /** Half of take-home pay, less debt payments and other essentials (the 50/30/20 "needs" bucket). */
  byNeedsBudget: number
  /** Annual gross income ÷ 40 — the screening rule many landlords use. */
  byIncomeMultiple: number
  /** 36% of gross monthly income, less existing debt payments. */
  byDebtToIncome: number

  /** The lowest of the four — a figure every rule of thumb agrees on. */
  recommendedMaxRent: number
  /** Which rule produced the recommended figure. */
  limitingRule: RentRule

  /** Annual gross income a landlord using the 40× rule would want for the recommended rent. */
  incomeNeededFor40x: number
  isValid: boolean
}

/** Landlords commonly require annual gross income of at least 40× the monthly rent. */
export const LANDLORD_INCOME_MULTIPLE = 40

/** Total debt (rent included) as a share of gross income, borrowed from lending's back-end DTI. */
export const DEBT_TO_INCOME_LIMIT = 36

/**
 * Estimates how much rent is affordable under four common rules of thumb.
 *
 * None of these rules is authoritative — each answers a slightly different
 * question. The 30% rule is a share of gross income; the 50/30/20 view starts
 * from take-home pay and subtracts other needs; the 40× rule is what a landlord
 * screens for; the debt-to-income view penalises existing debt payments. Rather
 * than pick one, we report all four and recommend the lowest, so the answer
 * holds up whichever lens you apply.
 */
export function calculateRentAffordability(
  input: RentAffordabilityInput
): RentAffordabilityResult {
  const income = money(input.grossIncome)
  const grossMonthlyIncome = input.incomeFrequency === 'monthly' ? income : income / 12
  const monthlyDebts = money(input.monthlyDebts)
  const rentSharePercent = Math.min(rate(input.rentSharePercent ?? 30), 100)
  const takeHomePercent = Math.min(rate(input.takeHomePercent ?? 75), 100)
  const monthlyEssentials = money(input.monthlyEssentials)

  const takeHomeMonthlyIncome = grossMonthlyIncome * (takeHomePercent / 100)

  const byIncomeShare = grossMonthlyIncome * (rentSharePercent / 100)
  const byNeedsBudget = Math.max(0, takeHomeMonthlyIncome * 0.5 - monthlyDebts - monthlyEssentials)
  const byIncomeMultiple = (grossMonthlyIncome * 12) / LANDLORD_INCOME_MULTIPLE
  const byDebtToIncome = Math.max(
    0,
    grossMonthlyIncome * (DEBT_TO_INCOME_LIMIT / 100) - monthlyDebts
  )

  // Ordered so that ties resolve to the most familiar rule first.
  const candidates: Array<[RentRule, number]> = [
    ['incomeShare', byIncomeShare],
    ['incomeMultiple', byIncomeMultiple],
    ['debtToIncome', byDebtToIncome],
    ['needsBudget', byNeedsBudget],
  ]
  let [limitingRule, recommended] = candidates[0]
  for (const [rule, value] of candidates) {
    if (value < recommended) {
      limitingRule = rule
      recommended = value
    }
  }

  const recommendedMaxRent = round2(recommended)

  return {
    grossMonthlyIncome: round2(grossMonthlyIncome),
    takeHomeMonthlyIncome: round2(takeHomeMonthlyIncome),
    byIncomeShare: round2(byIncomeShare),
    byNeedsBudget: round2(byNeedsBudget),
    byIncomeMultiple: round2(byIncomeMultiple),
    byDebtToIncome: round2(byDebtToIncome),
    recommendedMaxRent,
    limitingRule,
    incomeNeededFor40x: round2(recommendedMaxRent * LANDLORD_INCOME_MULTIPLE),
    isValid: grossMonthlyIncome > 0,
  }
}
