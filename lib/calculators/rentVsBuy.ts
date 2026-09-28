import { buildAmortizationSchedule } from './amortization'
import { money, rate, round2, signedRate, years } from './guards'

export interface RentVsBuyInput {
  // Buying
  homePrice: number
  downPayment: number
  mortgageRate: number
  mortgageTermYears: number
  /** Annual property tax as a percentage of home value, e.g. 1.1. */
  propertyTaxRate?: number
  annualHomeInsurance?: number
  /** Annual maintenance as a percentage of home value, typically 1. */
  annualMaintenancePercent?: number
  monthlyHoa?: number
  /** Closing costs on purchase, as a percentage of price. */
  buyingCostPercent?: number
  /** Agent and closing costs on sale, as a percentage of sale price. */
  sellingCostPercent?: number
  /** Expected annual home appreciation. May be negative. */
  homeAppreciationRate?: number

  // Renting
  monthlyRent: number
  annualRentIncrease?: number
  monthlyRentersInsurance?: number

  // Shared
  /** How long the person stays. The single most decisive input. */
  yearsStaying: number
  /**
   * Return available on cash not tied up in a house. This is what makes the
   * comparison fair — see the note on the engine below.
   */
  investmentReturnRate?: number
}

export interface RentVsBuyYear {
  year: number
  /** Cumulative cost of buying, net of equity built. */
  cumulativeBuyCost: number
  /** Cumulative cost of renting, net of investment growth on the freed-up cash. */
  cumulativeRentCost: number
  homeValue: number
  loanBalance: number
  equity: number
  /** Value of the renter's investment portfolio. */
  portfolioValue: number
}

export interface RentVsBuyResult {
  /** Total net cost of buying over the stay. */
  totalBuyCost: number
  /** Total net cost of renting over the stay. */
  totalRentCost: number
  /** Positive when buying is cheaper. */
  savingsFromBuying: number
  recommendation: 'buy' | 'rent' | 'tooClose'

  /** First year at which buying becomes cheaper, or null if it never does. */
  breakEvenYear: number | null

  monthlyMortgagePayment: number
  /** Full monthly cost of owning, including escrow and maintenance. */
  totalMonthlyOwnershipCost: number
  /** Rent in the first month, for comparison against the above. */
  initialMonthlyRent: number

  homeValueAtEnd: number
  equityAtEnd: number
  /** Cash in hand after selling and paying costs. */
  netProceedsFromSale: number

  yearly: RentVsBuyYear[]
  isValid: boolean
}

/**
 * Compares renting against buying over a defined period.
 *
 * The critical modelling choice: the renter's down payment does not vanish. A
 * comparison that comes out as "buying builds equity, renting builds nothing" is
 * rigged, because it silently assumes the would-be buyer's deposit earns zero. So
 * this engine invests the renter's down payment and closing costs at the given
 * return, and each month invests any difference where owning costs more than
 * renting. That opportunity cost is usually what decides the answer, and leaving
 * it out is the most common way these calculators mislead.
 *
 * Both sides are measured as net cost — money out, less assets held at the end.
 */
export function calculateRentVsBuy(input: RentVsBuyInput): RentVsBuyResult {
  const homePrice = money(input.homePrice)
  const downPayment = Math.min(money(input.downPayment), homePrice)
  const loanAmount = homePrice - downPayment
  const mortgageRate = rate(input.mortgageRate)
  const mortgageTermYears = years(input.mortgageTermYears) || 30

  const propertyTaxRate = rate(input.propertyTaxRate)
  const annualHomeInsurance = money(input.annualHomeInsurance)
  const maintenancePercent = rate(input.annualMaintenancePercent)
  const monthlyHoa = money(input.monthlyHoa)
  const buyingCostPercent = rate(input.buyingCostPercent)
  const sellingCostPercent = rate(input.sellingCostPercent)
  const appreciationRate = signedRate(input.homeAppreciationRate)

  const monthlyRent = money(input.monthlyRent)
  const rentIncrease = signedRate(input.annualRentIncrease)
  const rentersInsurance = money(input.monthlyRentersInsurance)

  const yearsStaying = years(input.yearsStaying)
  const investmentReturn = signedRate(input.investmentReturnRate)

  const empty: RentVsBuyResult = {
    totalBuyCost: 0,
    totalRentCost: 0,
    savingsFromBuying: 0,
    recommendation: 'tooClose',
    breakEvenYear: null,
    monthlyMortgagePayment: 0,
    totalMonthlyOwnershipCost: 0,
    initialMonthlyRent: round2(monthlyRent),
    homeValueAtEnd: 0,
    equityAtEnd: 0,
    netProceedsFromSale: 0,
    yearly: [],
    isValid: false,
  }
  if (homePrice <= 0 || yearsStaying <= 0 || monthlyRent <= 0) return empty

  const amortization = buildAmortizationSchedule({
    principal: loanAmount,
    annualRate: mortgageRate,
    totalPeriods: mortgageTermYears * 12,
  })
  const monthlyMortgagePayment = amortization.monthlyPayment

  const closingCosts = homePrice * (buyingCostPercent / 100)
  const monthlyInvestmentRate = investmentReturn / 100 / 12

  // The renter starts with the buyer's up-front cash invested instead.
  let portfolio = downPayment + closingCosts
  // Buyer's cash out so far, excluding the down payment and closing costs, which
  // are accounted for via equity and the portfolio respectively.
  let buyerCashSpent = 0
  let renterCashSpent = 0

  let homeValue = homePrice
  let currentRent = monthlyRent
  const yearly: RentVsBuyYear[] = []
  let breakEvenYear: number | null = null

  for (let year = 1; year <= yearsStaying; year++) {
    const annualPropertyTax = homeValue * (propertyTaxRate / 100)
    const annualMaintenance = homeValue * (maintenancePercent / 100)
    const monthlyEscrow =
      annualPropertyTax / 12 + annualHomeInsurance / 12 + annualMaintenance / 12 + monthlyHoa

    for (let month = 1; month <= 12; month++) {
      const absoluteMonth = (year - 1) * 12 + month
      const stillPaying = absoluteMonth <= amortization.actualPeriods

      const ownerMonthly = (stillPaying ? monthlyMortgagePayment : 0) + monthlyEscrow
      const renterMonthly = currentRent + rentersInsurance

      buyerCashSpent += ownerMonthly
      renterCashSpent += renterMonthly

      // Grow the renter's portfolio, then invest the monthly saving (if any).
      portfolio += portfolio * monthlyInvestmentRate
      const monthlySaving = ownerMonthly - renterMonthly
      if (monthlySaving > 0) portfolio += monthlySaving

      homeValue *= Math.pow(1 + appreciationRate / 100, 1 / 12)
    }

    currentRent *= 1 + rentIncrease / 100

    const monthsElapsed = year * 12
    const loanBalance =
      monthsElapsed <= amortization.rows.length
        ? amortization.rows[monthsElapsed - 1].balance
        : 0
    const equity = Math.max(0, homeValue - loanBalance)
    const sellingCosts = homeValue * (sellingCostPercent / 100)

    /*
      Net cost of buying = every dollar paid out (including up-front cash) minus
      what walking away is worth after selling costs.
    */
    const netBuyCost = buyerCashSpent + downPayment + closingCosts - (equity - sellingCosts)

    // Net cost of renting = rent paid minus the portfolio the renter holds.
    const netRentCost = renterCashSpent - portfolio + (downPayment + closingCosts)

    yearly.push({
      year,
      cumulativeBuyCost: round2(netBuyCost),
      cumulativeRentCost: round2(netRentCost),
      homeValue: round2(homeValue),
      loanBalance: round2(loanBalance),
      equity: round2(equity),
      portfolioValue: round2(portfolio),
    })

    if (breakEvenYear === null && netBuyCost < netRentCost) breakEvenYear = year
  }

  const final = yearly[yearly.length - 1]
  const totalBuyCost = final.cumulativeBuyCost
  const totalRentCost = final.cumulativeRentCost
  const savingsFromBuying = round2(totalRentCost - totalBuyCost)

  const finalPropertyTax = final.homeValue * (propertyTaxRate / 100)
  const finalMaintenance = final.homeValue * (maintenancePercent / 100)

  // "Too close to call" when the gap is under 5% of the home price — within the
  // noise of the assumptions, and claiming a winner there would be false precision.
  const materialityThreshold = homePrice * 0.05
  const recommendation: RentVsBuyResult['recommendation'] =
    Math.abs(savingsFromBuying) < materialityThreshold
      ? 'tooClose'
      : savingsFromBuying > 0
        ? 'buy'
        : 'rent'

  return {
    totalBuyCost,
    totalRentCost,
    savingsFromBuying,
    recommendation,
    breakEvenYear,
    monthlyMortgagePayment,
    totalMonthlyOwnershipCost: round2(
      monthlyMortgagePayment +
        finalPropertyTax / 12 +
        annualHomeInsurance / 12 +
        finalMaintenance / 12 +
        monthlyHoa
    ),
    initialMonthlyRent: round2(monthlyRent),
    homeValueAtEnd: final.homeValue,
    equityAtEnd: final.equity,
    netProceedsFromSale: round2(final.equity - final.homeValue * (sellingCostPercent / 100)),
    yearly,
    isValid: true,
  }
}
