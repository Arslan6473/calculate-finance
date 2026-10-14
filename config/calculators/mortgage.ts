import type { CalculatorConfig } from './types'

export const mortgageConfig: CalculatorConfig = {
  slug: 'mortgage-calculator',
  name: 'Mortgage Calculator',
  shortName: 'Mortgage',
  category: 'loans-mortgages',
  updated: '2026-10-14',
  summary: 'Estimate your monthly mortgage payment, amortization schedule, and total cost.',
  inputs: [
    {
      name: 'homePrice',
      label: 'Home price',
      type: 'currency',
      defaultValue: 400_000,
      min: 0,
      max: 20_000_000,
      step: 5_000,
      group: 'Loan details',
    },
    {
      name: 'downPayment',
      label: 'Down payment',
      type: 'currency',
      defaultValue: 80_000,
      min: 0,
      max: 20_000_000,
      step: 1_000,
      help: 'Cash paid upfront. Below 20% of the home price usually requires PMI.',
      group: 'Loan details',
    },
    {
      name: 'termYears',
      label: 'Loan term',
      type: 'select',
      defaultValue: 30,
      options: [
        { label: '30 years', value: 30 },
        { label: '20 years', value: 20 },
        { label: '15 years', value: 15 },
        { label: '10 years', value: 10 },
      ],
      group: 'Loan details',
    },
    {
      name: 'annualRate',
      label: 'Interest rate',
      type: 'percent',
      defaultValue: 6.5,
      min: 0,
      max: 25,
      step: 0.01,
      group: 'Loan details',
    },
    {
      name: 'annualPropertyTax',
      label: 'Annual property tax',
      type: 'currency',
      defaultValue: 4_800,
      min: 0,
      max: 500_000,
      step: 100,
      group: 'Escrow & fees',
    },
    {
      name: 'annualHomeInsurance',
      label: 'Annual home insurance',
      type: 'currency',
      defaultValue: 1_500,
      min: 0,
      max: 100_000,
      step: 50,
      group: 'Escrow & fees',
    },
    {
      name: 'monthlyHoa',
      label: 'Monthly HOA fee',
      type: 'currency',
      defaultValue: 0,
      min: 0,
      max: 5_000,
      step: 10,
      group: 'Escrow & fees',
    },
    {
      name: 'pmiRate',
      label: 'PMI rate',
      type: 'percent',
      defaultValue: 0.5,
      min: 0,
      max: 5,
      step: 0.05,
      help: 'Annual private mortgage insurance rate, charged while equity is below 20%.',
      group: 'Escrow & fees',
    },
    {
      name: 'extraMonthlyPayment',
      label: 'Extra monthly payment',
      type: 'currency',
      defaultValue: 0,
      min: 0,
      max: 50_000,
      step: 25,
      help: 'Optional additional principal paid every month to shorten the loan.',
      group: 'Escrow & fees',
    },
  ],
  faqs: [
    {
      question: 'How is my monthly mortgage payment calculated?',
      answer:
        'Your principal and interest payment uses the standard amortization formula, which spreads the loan amount across every payment so each one covers that month\'s interest plus a growing share of principal. Property tax, home insurance, HOA fees, and PMI (if applicable) are added on top as separate monthly costs.',
    },
    {
      question: 'What is PMI and when does it go away?',
      answer:
        'Private mortgage insurance protects the lender when your down payment is below 20% of the home price. It is calculated as a percentage of your loan balance and typically stops once your equity reaches 20%, which this calculator tracks month by month.',
    },
    {
      question: 'How much does an extra monthly payment actually save?',
      answer:
        'Extra principal payments reduce the balance the loan accrues interest on for every remaining month, so even a modest extra payment can save years and thousands of dollars in interest. Enter an amount in "Extra monthly payment" to see the effect on your specific loan.',
    },
    {
      question: 'Should I choose a 15-year or 30-year mortgage?',
      answer:
        'A 15-year loan carries a lower interest rate and far less total interest, but a significantly higher monthly payment. A 30-year loan is more affordable month to month but costs more overall. Try both terms here to compare the trade-off in dollars.',
    },
    {
      question: 'Does this include closing costs?',
      answer:
        'No. This calculator covers the ongoing monthly cost of the mortgage. Closing costs are a one-time expense paid at purchase, separate from what is modeled here.',
    },
  ],
  related: [
    'loan-calculator',
    'rent-vs-buy-calculator',
    'compound-interest-calculator',
    'debt-payoff-calculator',
  ],
  seo: {
    title: 'Mortgage Calculator — Estimate Your Monthly Payment | Calcxs',
    description:
      'Use our free mortgage calculator to estimate your monthly payment, total interest, amortization schedule, and total cost of your home loan.',
    keywords: ['mortgage calculator', 'home loan calculator', 'monthly mortgage payment'],
  },
}
