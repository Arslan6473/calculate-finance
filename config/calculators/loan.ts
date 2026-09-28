import type { CalculatorConfig } from './types'

export const loanConfig: CalculatorConfig = {
  slug: 'loan-calculator',
  name: 'Loan Calculator',
  shortName: 'Loan',
  category: 'loans-mortgages',
  summary: 'Calculate the payment, total interest, and effective APR on any instalment loan.',
  inputs: [
    {
      name: 'loanAmount',
      label: 'Loan amount',
      type: 'currency',
      defaultValue: 25_000,
      min: 0,
      max: 5_000_000,
      step: 500,
    },
    {
      name: 'annualRate',
      label: 'Interest rate (APR)',
      type: 'percent',
      defaultValue: 8,
      min: 0,
      max: 50,
      step: 0.01,
    },
    {
      name: 'termMonths',
      label: 'Loan term',
      type: 'select',
      defaultValue: 60,
      options: [
        { label: '2 years', value: 24 },
        { label: '3 years', value: 36 },
        { label: '4 years', value: 48 },
        { label: '5 years', value: 60 },
        { label: '7 years', value: 84 },
      ],
    },
    {
      name: 'originationFee',
      label: 'Origination fee',
      type: 'currency',
      defaultValue: 0,
      min: 0,
      max: 500_000,
      step: 50,
      help: 'A one-time fee deducted from the amount you actually receive.',
    },
    {
      name: 'extraMonthlyPayment',
      label: 'Extra monthly payment',
      type: 'currency',
      defaultValue: 0,
      min: 0,
      max: 50_000,
      step: 25,
    },
  ],
  faqs: [
    {
      question: 'What is the difference between the interest rate and the effective APR?',
      answer:
        'The interest rate determines your monthly payment. The effective APR also accounts for any origination fee, which reduces the money you actually receive without reducing what you owe — so it raises the true annual cost of the loan above the stated rate.',
    },
    {
      question: 'How is the monthly payment calculated?',
      answer:
        'This calculator uses the standard amortizing-loan formula: each fixed payment covers that month\'s interest on the remaining balance, with the rest reducing principal, so the balance reaches zero exactly at the end of the term.',
    },
    {
      question: 'Does an origination fee change my monthly payment?',
      answer:
        'No — your payment is based on the full loan amount you owe, including the fee if it was added to the loan rather than paid separately. What the fee changes is how much cash you actually receive, which is why the effective APR is higher.',
    },
    {
      question: 'What kinds of loans can I use this for?',
      answer:
        'Any fixed-rate instalment loan with equal monthly payments — personal loans, auto loans, student loans, and business term loans all use the same amortization math modeled here.',
    },
    {
      question: 'How much can an extra payment save me?',
      answer:
        'Extra principal payments shorten the loan and reduce total interest, because every dollar of extra principal stops accruing interest immediately. Enter an amount to see the exact effect on your payoff time and total cost.',
    },
  ],
  related: [
    'mortgage-calculator',
    'debt-payoff-calculator',
    'credit-card-payoff-calculator',
    'roi-calculator',
  ],
  seo: {
    title: 'Loan Calculator — Payment, Interest & Effective APR | Calcxs',
    description:
      'Free loan calculator for personal, auto, student, and business loans. See your monthly payment, total interest, and true effective APR including fees.',
    keywords: ['loan calculator', 'personal loan calculator', 'auto loan calculator', 'apr calculator'],
  },
}
