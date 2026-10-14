import { describe, expect, it } from 'vitest'
import { calculateRentVsBuy } from '@/lib/calculators/rentVsBuy'

const baseInput = {
  homePrice: 400_000,
  downPayment: 80_000,
  mortgageRate: 6.5,
  mortgageTermYears: 30,
  propertyTaxRate: 1.1,
  annualHomeInsurance: 1500,
  annualMaintenancePercent: 1,
  buyingCostPercent: 2,
  sellingCostPercent: 6,
  homeAppreciationRate: 3,
  monthlyRent: 2200,
  annualRentIncrease: 3,
  yearsStaying: 10,
  investmentReturnRate: 6,
}

describe('calculateRentVsBuy', () => {
  it('produces a valid comparison with a yearly breakdown', () => {
    const result = calculateRentVsBuy(baseInput)
    expect(result.isValid).toBe(true)
    expect(result.yearly).toHaveLength(10)
  })

  it('counts invested monthly savings as cash out, so 0% return leaves renting costing exactly the rent paid', () => {
    const result = calculateRentVsBuy({ ...baseInput, investmentReturnRate: 0 })
    let expectedRent = 0
    for (let year = 0; year < baseInput.yearsStaying; year++) {
      expectedRent += 12 * baseInput.monthlyRent * Math.pow(1 + baseInput.annualRentIncrease / 100, year)
    }
    expect(result.totalRentCost).toBeCloseTo(expectedRent, 0)
  })

  it('favours buying when appreciation is strong and the stay is long', () => {
    const result = calculateRentVsBuy({ ...baseInput, yearsStaying: 20, homeAppreciationRate: 5 })
    expect(result.recommendation).toBe('buy')
  })

  it('favours renting when rent is cheap and the stay is short', () => {
    const result = calculateRentVsBuy({
      ...baseInput,
      monthlyRent: 1200,
      yearsStaying: 2,
      homeAppreciationRate: 1,
    })
    expect(result.recommendation).toBe('rent')
  })

  it('invests the down payment for the renter rather than treating it as sunk cost', () => {
    const highReturn = calculateRentVsBuy({ ...baseInput, investmentReturnRate: 12 })
    const lowReturn = calculateRentVsBuy({ ...baseInput, investmentReturnRate: 1 })
    // A higher return on the renter's invested down payment should reduce net rent cost.
    expect(highReturn.totalRentCost).toBeLessThan(lowReturn.totalRentCost)
  })

  it('finds a break-even year when buying eventually wins', () => {
    const result = calculateRentVsBuy({ ...baseInput, yearsStaying: 25, homeAppreciationRate: 4 })
    if (result.recommendation === 'buy') {
      expect(result.breakEvenYear).not.toBeNull()
    }
  })

  it('returns an invalid result for a zero home price', () => {
    const result = calculateRentVsBuy({ ...baseInput, homePrice: 0 })
    expect(result.isValid).toBe(false)
  })

  it('returns an invalid result for a zero monthly rent', () => {
    const result = calculateRentVsBuy({ ...baseInput, monthlyRent: 0 })
    expect(result.isValid).toBe(false)
  })

  it('handles a zero mortgage rate', () => {
    const result = calculateRentVsBuy({ ...baseInput, mortgageRate: 0 })
    expect(Number.isFinite(result.monthlyMortgagePayment)).toBe(true)
  })

  it('handles a negative appreciation rate without crashing', () => {
    const result = calculateRentVsBuy({ ...baseInput, homeAppreciationRate: -2 })
    expect(Number.isFinite(result.homeValueAtEnd)).toBe(true)
    expect(result.homeValueAtEnd).toBeLessThan(baseInput.homePrice)
  })

  it('handles large numbers without NaN or Infinity', () => {
    const result = calculateRentVsBuy({
      ...baseInput,
      homePrice: 5e7,
      downPayment: 1e7,
      monthlyRent: 200_000,
    })
    expect(Number.isFinite(result.totalBuyCost)).toBe(true)
    expect(Number.isFinite(result.totalRentCost)).toBe(true)
  })
})
