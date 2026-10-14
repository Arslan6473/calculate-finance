import type { ComponentType } from 'react'

import { AutoLoanCalculator } from './AutoLoanCalculator'
import { CagrCalculator } from './CagrCalculator'
import { CompoundInterestCalculator } from './CompoundInterestCalculator'
import { CreditCardCalculator } from './CreditCardCalculator'
import { DebtPayoffCalculator } from './DebtPayoffCalculator'
import { DebtToIncomeCalculator } from './DebtToIncomeCalculator'
import { HomeAffordabilityCalculator } from './HomeAffordabilityCalculator'
import { HourlyToSalaryCalculator } from './HourlyToSalaryCalculator'
import { InflationCalculator } from './InflationCalculator'
import { InvestmentCalculator } from './InvestmentCalculator'
import { LoanCalculator } from './LoanCalculator'
import { MortgageCalculator } from './MortgageCalculator'
import { OvertimeCalculator } from './OvertimeCalculator'
import { RaiseCalculator } from './RaiseCalculator'
import { RefinanceCalculator } from './RefinanceCalculator'
import { RentAffordabilityCalculator } from './RentAffordabilityCalculator'
import { RentalPropertyCalculator } from './RentalPropertyCalculator'
import { RentVsBuyCalculator } from './RentVsBuyCalculator'
import { RetirementCalculator } from './RetirementCalculator'
import { RoiCalculator } from './RoiCalculator'
import { SalaryCalculator } from './SalaryCalculator'
import { SavingsGoalCalculator } from './SavingsGoalCalculator'

/**
 * Maps a calculator slug to its results-and-charts component (design spec §3:
 * the one part of each calculator that is a component rather than config,
 * because that's where calculators genuinely differ). The route module looks
 * this up rather than switching on slug itself.
 */
export const CALCULATOR_COMPONENTS: Record<string, ComponentType> = {
  'mortgage-calculator': MortgageCalculator,
  'loan-calculator': LoanCalculator,
  'auto-loan-calculator': AutoLoanCalculator,
  'refinance-calculator': RefinanceCalculator,
  'compound-interest-calculator': CompoundInterestCalculator,
  'investment-calculator': InvestmentCalculator,
  'savings-goal-calculator': SavingsGoalCalculator,
  'inflation-calculator': InflationCalculator,
  'cagr-calculator': CagrCalculator,
  'roi-calculator': RoiCalculator,
  'retirement-calculator': RetirementCalculator,
  'salary-calculator': SalaryCalculator,
  'hourly-to-salary-calculator': HourlyToSalaryCalculator,
  'raise-calculator': RaiseCalculator,
  'overtime-calculator': OvertimeCalculator,
  'debt-payoff-calculator': DebtPayoffCalculator,
  'debt-to-income-calculator': DebtToIncomeCalculator,
  'credit-card-payoff-calculator': CreditCardCalculator,
  'rent-vs-buy-calculator': RentVsBuyCalculator,
  'home-affordability-calculator': HomeAffordabilityCalculator,
  'rent-affordability-calculator': RentAffordabilityCalculator,
  'rental-property-calculator': RentalPropertyCalculator,
}
