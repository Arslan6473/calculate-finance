import type { CalculatorConfig } from './types'

export const autoLoanConfig: CalculatorConfig = {
  slug: 'auto-loan-calculator',
  name: 'Auto Loan Calculator',
  shortName: 'Auto Loan',
  category: 'loans-mortgages',
  updated: '2026-10-14',
  summary:
    'Estimate your car payment with sales tax, fees, trade-in and negative equity included.',
  inputs: [
    {
      name: 'vehiclePrice',
      label: 'Vehicle price',
      type: 'currency',
      defaultValue: 35_000,
      min: 0,
      max: 1_000_000,
      step: 500,
      help: 'The negotiated price before tax, fees, down payment or trade-in.',
      group: 'Vehicle & trade-in',
    },
    {
      name: 'downPayment',
      label: 'Down payment',
      type: 'currency',
      defaultValue: 5_000,
      min: 0,
      max: 1_000_000,
      step: 500,
      group: 'Vehicle & trade-in',
    },
    {
      name: 'tradeInValue',
      label: 'Trade-in value',
      type: 'currency',
      defaultValue: 8_000,
      min: 0,
      max: 1_000_000,
      step: 250,
      group: 'Vehicle & trade-in',
    },
    {
      name: 'tradeInOwed',
      label: 'Amount owed on trade-in',
      type: 'currency',
      defaultValue: 10_000,
      min: 0,
      max: 1_000_000,
      step: 250,
      help: 'Any balance above the trade-in value is rolled into the new loan as negative equity.',
      group: 'Vehicle & trade-in',
    },
    {
      name: 'salesTaxRate',
      label: 'Sales tax rate',
      type: 'percent',
      defaultValue: 7,
      min: 0,
      max: 20,
      step: 0.05,
      help: 'Applied to the price minus the trade-in value, as most states do.',
      group: 'Taxes & fees',
    },
    {
      name: 'fees',
      label: 'Title, registration & doc fees',
      type: 'currency',
      defaultValue: 800,
      min: 0,
      max: 50_000,
      step: 25,
      group: 'Taxes & fees',
    },
    {
      name: 'financeTaxAndFees',
      label: 'Include tax and fees in the loan',
      type: 'toggle',
      defaultValue: true,
      help: 'Off means you pay tax and fees in cash at signing.',
      group: 'Taxes & fees',
    },
    {
      name: 'annualRate',
      label: 'Interest rate (APR)',
      type: 'percent',
      defaultValue: 7,
      min: 0,
      max: 40,
      step: 0.01,
      group: 'Loan terms',
    },
    {
      name: 'termMonths',
      label: 'Loan term',
      type: 'select',
      defaultValue: 60,
      options: [
        { label: '36 months', value: 36 },
        { label: '48 months', value: 48 },
        { label: '60 months', value: 60 },
        { label: '72 months', value: 72 },
        { label: '84 months', value: 84 },
      ],
      group: 'Loan terms',
    },
  ],
  faqs: [
    {
      question: 'How does a trade-in lower my sales tax?',
      answer:
        'In most states sales tax is charged on the vehicle price minus the trade-in value, so an $8,000 trade-in on a $35,000 car means tax on $27,000. A few states tax the full price regardless of a trade-in, so check your state rules and set the tax rate accordingly.',
    },
    {
      question: 'What is negative equity on a trade-in?',
      answer:
        'It is the amount you still owe on your current car above what the dealer pays for it. If you owe $10,000 and the trade-in is worth $8,000, the $2,000 difference does not disappear: it is added to your new loan, so you pay interest on debt from a car you no longer own.',
    },
    {
      question: 'Should I finance the sales tax and fees?',
      answer:
        'Financing them reduces the cash you need at signing but adds them to the balance that accrues interest for the whole term. Paying them upfront lowers the monthly payment and total interest. Toggle the option to see the difference for your numbers.',
    },
    {
      question: 'Is a 72- or 84-month car loan a bad idea?',
      answer:
        'A longer term lowers the monthly payment but raises total interest, often comes with a higher rate, and makes it more likely you will owe more than the car is worth for years. Compare total interest across terms before choosing the lowest payment.',
    },
    {
      question: 'Does the payment include insurance or registration renewals?',
      answer:
        'No. The payment covers the loan only. Car insurance, annual registration, fuel and maintenance are ongoing costs of ownership you should budget for separately.',
    },
  ],
  related: [
    'loan-calculator',
    'debt-to-income-calculator',
    'debt-payoff-calculator',
    'savings-goal-calculator',
  ],
  seo: {
    title: 'Auto Loan Calculator with Tax & Trade-In | Calcxs',
    description:
      'Free auto loan calculator with sales tax, fees, trade-in credit and negative equity. See your car payment, amount financed and total interest by term.',
    keywords: [
      'auto loan calculator',
      'car payment calculator',
      'car loan calculator with trade in',
      'negative equity calculator',
    ],
  },
}
