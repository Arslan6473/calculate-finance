import { MAX_MONEY, money, round2, signedRate, years } from './guards'

export interface InvestmentInput {
  initialInvestment: number
  monthlyContribution: number
  /** Expected annual return as a percentage. May be negative. */
  annualReturn: number
  termYears: number
  /** Annual inflation used to express the result in today's money. */
  inflationRate?: number
  /** Annual fund fee or expense ratio, deducted from the return. */
  annualFeePercent?: number
  /** Percentage increase applied to the contribution each year. */
  annualContributionIncrease?: number
}

export interface InvestmentYear {
  year: number
  balance: number
  totalContributed: number
  totalGrowth: number
  /** Balance expressed in today's purchasing power. */
  realBalance: number
}

export interface InvestmentResult {
  finalBalance: number
  totalContributed: number
  totalGrowth: number
  /** Final balance adjusted for inflation. */
  realFinalBalance: number
  /** Total fees paid over the term. */
  totalFees: number
  /** Return net of fees. */
  netAnnualReturn: number
  /** Compound annual growth rate actually achieved on the money invested. */
  effectiveCagr: number
  yearly: InvestmentYear[]
  isValid: boolean
}

/**
 * Projects an investment portfolio with monthly contributions.
 *
 * Distinct from the compound-interest engine in three ways that matter to
 * investors rather than savers: fees are deducted from the gross return, the
 * contribution can escalate annually to model rising income, and the result is
 * also reported in inflation-adjusted terms because a nominal figure thirty
 * years out badly overstates real purchasing power.
 */
export function calculateInvestment(input: InvestmentInput): InvestmentResult {
  const initialInvestment = money(input.initialInvestment)
  const baseMonthlyContribution = money(input.monthlyContribution)
  const grossReturn = signedRate(input.annualReturn)
  const termYears = years(input.termYears)
  const inflationRate = signedRate(input.inflationRate)
  const feePercent = Math.min(money(input.annualFeePercent), 100)
  const contributionIncrease = Math.min(money(input.annualContributionIncrease), 100)

  const netAnnualReturn = round2(grossReturn - feePercent)

  const empty: InvestmentResult = {
    finalBalance: round2(initialInvestment),
    totalContributed: round2(initialInvestment),
    totalGrowth: 0,
    realFinalBalance: round2(initialInvestment),
    totalFees: 0,
    netAnnualReturn,
    effectiveCagr: 0,
    yearly: [],
    isValid: false,
  }
  if (termYears <= 0 || (initialInvestment <= 0 && baseMonthlyContribution <= 0)) return empty

  const monthlyNetRate = netAnnualReturn / 100 / 12
  const monthlyGrossRate = grossReturn / 100 / 12

  let balance = initialInvestment
  let totalContributed = initialInvestment
  let totalFees = 0
  let monthlyContribution = baseMonthlyContribution

  const yearly: InvestmentYear[] = []

  for (let year = 1; year <= termYears; year++) {
    for (let month = 1; month <= 12; month++) {
      // Fee is charged on the balance before the contribution, which is how
      // expense ratios actually work — they are levied on assets under management.
      const grossGrowth = balance * monthlyGrossRate
      const fee = balance * (monthlyGrossRate - monthlyNetRate)
      totalFees += fee

      balance += grossGrowth - fee

      if (monthlyContribution > 0) {
        balance += monthlyContribution
        totalContributed += monthlyContribution
      }

      if (balance > MAX_MONEY) {
        balance = MAX_MONEY
        break
      }
      if (balance < 0) balance = 0
    }

    // Inflation discounting uses years elapsed, applied to the nominal balance.
    const inflationDivisor = Math.pow(1 + inflationRate / 100, year)

    yearly.push({
      year,
      balance: round2(balance),
      totalContributed: round2(totalContributed),
      totalGrowth: round2(balance - totalContributed),
      realBalance: round2(inflationDivisor > 0 ? balance / inflationDivisor : balance),
    })

    if (contributionIncrease > 0) {
      monthlyContribution = monthlyContribution * (1 + contributionIncrease / 100)
    }
  }

  const finalBalance = round2(balance)
  const finalContributed = round2(totalContributed)
  const inflationDivisor = Math.pow(1 + inflationRate / 100, termYears)

  // CAGR on contributed capital. Only meaningful with a positive starting base.
  const effectiveCagr =
    finalContributed > 0 && termYears > 0 && finalBalance > 0
      ? round2((Math.pow(finalBalance / finalContributed, 1 / termYears) - 1) * 100)
      : 0

  return {
    finalBalance,
    totalContributed: finalContributed,
    totalGrowth: round2(finalBalance - finalContributed),
    realFinalBalance: round2(inflationDivisor > 0 ? finalBalance / inflationDivisor : finalBalance),
    totalFees: round2(totalFees),
    netAnnualReturn,
    effectiveCagr,
    yearly,
    isValid: true,
  }
}
