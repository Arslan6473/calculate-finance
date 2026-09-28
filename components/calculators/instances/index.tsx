import type { ComponentType } from 'react'

import { CompoundInterestCalculator } from './CompoundInterestCalculator'
import { CreditCardCalculator } from './CreditCardCalculator'
import { DebtPayoffCalculator } from './DebtPayoffCalculator'
import { InvestmentCalculator } from './InvestmentCalculator'
import { LoanCalculator } from './LoanCalculator'
import { MortgageCalculator } from './MortgageCalculator'
import { RentVsBuyCalculator } from './RentVsBuyCalculator'
import { RetirementCalculator } from './RetirementCalculator'
import { RoiCalculator } from './RoiCalculator'
import { SalaryCalculator } from './SalaryCalculator'

/**
 * Maps a calculator slug to its results-and-charts component (design spec §3:
 * the one part of each calculator that is a component rather than config,
 * because that's where calculators genuinely differ). The route module looks
 * this up rather than switching on slug itself.
 */
export const CALCULATOR_COMPONENTS: Record<string, ComponentType> = {
  'mortgage-calculator': MortgageCalculator,
  'loan-calculator': LoanCalculator,
  'compound-interest-calculator': CompoundInterestCalculator,
  'investment-calculator': InvestmentCalculator,
  'roi-calculator': RoiCalculator,
  'retirement-calculator': RetirementCalculator,
  'salary-calculator': SalaryCalculator,
  'debt-payoff-calculator': DebtPayoffCalculator,
  'credit-card-payoff-calculator': CreditCardCalculator,
  'rent-vs-buy-calculator': RentVsBuyCalculator,
}
