import { MAX_MONEY, age, money, round2, signedRate } from './guards'

export interface RetirementInput {
  currentAge: number
  retirementAge: number
  currentSavings: number
  monthlyContribution: number
  /** Employer match as a percentage of the employee contribution, e.g. 50. */
  employerMatchPercent?: number
  /** Expected annual return while working. */
  preRetirementReturn: number
  /** Expected annual return in retirement, usually lower as the portfolio de-risks. */
  postRetirementReturn?: number
  annualInflation?: number
  /** Desired annual income in retirement, in today's money. */
  desiredAnnualIncome?: number
  /** Age to which the portfolio must last. */
  lifeExpectancy?: number
}

export interface RetirementYear {
  age: number
  balance: number
  totalContributed: number
  totalGrowth: number
  /** True once the person has stopped working. */
  isRetired: boolean
}

export interface RetirementResult {
  /** Portfolio value on the retirement date. */
  balanceAtRetirement: number
  totalContributed: number
  totalEmployerMatch: number
  totalGrowth: number

  /** Nominal annual income needed at retirement, inflated from today's money. */
  incomeNeededAtRetirement: number
  /**
   * Portfolio required to fund that income for the full retirement, accounting
   * for continued growth and inflation during drawdown.
   */
  targetPortfolio: number
  /** Positive means on track, negative means short. */
  surplusOrShortfall: number
  onTrack: boolean

  /** Age at which the money runs out, or null if it lasts past life expectancy. */
  moneyRunsOutAtAge: number | null
  /** Sustainable annual income the actual portfolio can support. */
  sustainableAnnualIncome: number

  yearly: RetirementYear[]
  yearsToRetirement: number
  isValid: boolean
}

/**
 * Projects retirement savings through accumulation and drawdown.
 *
 * The drawdown half is what makes this more than a future-value calculation. A
 * portfolio in retirement is simultaneously growing at the post-retirement rate
 * and shrinking by withdrawals that themselves rise with inflation, so whether
 * the money lasts is not something a single formula answers. Stepping year by
 * year through retirement is both more accurate and more honest than applying a
 * flat 4% rule.
 */
export function calculateRetirement(input: RetirementInput): RetirementResult {
  const currentAge = age(input.currentAge)
  const retirementAge = age(input.retirementAge)
  const lifeExpectancy = Math.max(age(input.lifeExpectancy ?? 90), retirementAge)

  const currentSavings = money(input.currentSavings)
  const monthlyContribution = money(input.monthlyContribution)
  const employerMatchPercent = Math.min(money(input.employerMatchPercent), 200)

  const preReturn = signedRate(input.preRetirementReturn)
  const postReturn = signedRate(input.postRetirementReturn ?? input.preRetirementReturn)
  const inflation = signedRate(input.annualInflation)
  const desiredAnnualIncome = money(input.desiredAnnualIncome)

  const yearsToRetirement = Math.max(0, retirementAge - currentAge)

  const empty: RetirementResult = {
    balanceAtRetirement: round2(currentSavings),
    totalContributed: round2(currentSavings),
    totalEmployerMatch: 0,
    totalGrowth: 0,
    incomeNeededAtRetirement: 0,
    targetPortfolio: 0,
    surplusOrShortfall: 0,
    onTrack: false,
    moneyRunsOutAtAge: null,
    sustainableAnnualIncome: 0,
    yearly: [],
    yearsToRetirement,
    isValid: false,
  }

  if (retirementAge <= currentAge || (currentSavings <= 0 && monthlyContribution <= 0)) {
    return empty
  }

  const monthlyMatch = monthlyContribution * (employerMatchPercent / 100)
  const monthlyTotal = monthlyContribution + monthlyMatch
  const preMonthlyRate = preReturn / 100 / 12

  let balance = currentSavings
  let totalContributed = currentSavings
  let totalEmployerMatch = 0

  const yearly: RetirementYear[] = []

  // --- Accumulation ---
  for (let year = 1; year <= yearsToRetirement; year++) {
    for (let month = 1; month <= 12; month++) {
      balance += balance * preMonthlyRate
      balance += monthlyTotal
      totalContributed += monthlyContribution
      totalEmployerMatch += monthlyMatch
      if (balance > MAX_MONEY) {
        balance = MAX_MONEY
        break
      }
      if (balance < 0) balance = 0
    }

    yearly.push({
      age: currentAge + year,
      balance: round2(balance),
      totalContributed: round2(totalContributed + totalEmployerMatch),
      totalGrowth: round2(balance - totalContributed - totalEmployerMatch),
      isRetired: false,
    })
  }

  const balanceAtRetirement = round2(balance)

  // Desired income is given in today's money; inflate it to the retirement date.
  const inflationFactor = Math.pow(1 + inflation / 100, yearsToRetirement)
  const incomeNeededAtRetirement = round2(desiredAnnualIncome * inflationFactor)

  // --- Drawdown ---
  const retirementYears = Math.max(0, lifeExpectancy - retirementAge)
  const postAnnualRate = postReturn / 100

  let drawdownBalance = balance
  let withdrawal = incomeNeededAtRetirement
  let moneyRunsOutAtAge: number | null = null

  for (let year = 1; year <= retirementYears; year++) {
    // Withdraw at the start of the year, then grow the remainder.
    drawdownBalance -= withdrawal
    if (drawdownBalance <= 0) {
      drawdownBalance = 0
      if (moneyRunsOutAtAge === null) moneyRunsOutAtAge = retirementAge + year
    } else {
      drawdownBalance += drawdownBalance * postAnnualRate
    }

    yearly.push({
      age: retirementAge + year,
      balance: round2(drawdownBalance),
      totalContributed: round2(totalContributed + totalEmployerMatch),
      totalGrowth: round2(
        Math.max(0, drawdownBalance) - Math.max(0, totalContributed + totalEmployerMatch)
      ),
      isRetired: true,
    })

    // Next year's withdrawal keeps pace with inflation.
    withdrawal = withdrawal * (1 + inflation / 100)
  }

  /*
    Target portfolio: the lump sum at retirement that exactly funds the inflating
    withdrawal stream for `retirementYears`. This is the present value of a
    growing annuity, discounted at the post-retirement return.

    When the real return is zero (return equals inflation) the growing-annuity
    formula divides by zero, and the answer collapses to income × years.
  */
  let targetPortfolio = 0
  if (retirementYears > 0 && incomeNeededAtRetirement > 0) {
    const r = postAnnualRate
    const g = inflation / 100
    if (Math.abs(r - g) < 1e-9) {
      targetPortfolio = incomeNeededAtRetirement * retirementYears
    } else {
      targetPortfolio =
        incomeNeededAtRetirement * ((1 - Math.pow((1 + g) / (1 + r), retirementYears)) / (r - g))
    }
    targetPortfolio = Math.min(Math.max(targetPortfolio, 0), MAX_MONEY)
  }

  /*
    Sustainable income: invert the same growing annuity for the portfolio the
    person is actually projected to have.
  */
  let sustainableAnnualIncome = 0
  if (retirementYears > 0 && balanceAtRetirement > 0) {
    const r = postAnnualRate
    const g = inflation / 100
    const annuityFactor =
      Math.abs(r - g) < 1e-9
        ? retirementYears
        : (1 - Math.pow((1 + g) / (1 + r), retirementYears)) / (r - g)
    sustainableAnnualIncome = annuityFactor > 0 ? balanceAtRetirement / annuityFactor : 0
  }

  return {
    balanceAtRetirement,
    totalContributed: round2(totalContributed),
    totalEmployerMatch: round2(totalEmployerMatch),
    totalGrowth: round2(balanceAtRetirement - totalContributed - totalEmployerMatch),
    incomeNeededAtRetirement,
    targetPortfolio: round2(targetPortfolio),
    surplusOrShortfall: round2(balanceAtRetirement - targetPortfolio),
    onTrack: targetPortfolio > 0 ? balanceAtRetirement >= targetPortfolio : balanceAtRetirement > 0,
    moneyRunsOutAtAge,
    sustainableAnnualIncome: round2(sustainableAnnualIncome),
    yearly,
    yearsToRetirement,
    isValid: true,
  }
}
