import type { CalculatorConfig } from './types'

export const debtToIncomeConfig: CalculatorConfig = {
  slug: 'debt-to-income-calculator',
  name: 'Debt-to-Income (DTI) Ratio Calculator',
  shortName: 'Debt-to-Income',
  category: 'debt',
  updated: '2026-10-14',
  summary:
    'Calculate your front-end and back-end debt-to-income ratios and see how they compare with common lender guidelines.',
  inputs: [
    {
      name: 'grossMonthlyIncome',
      label: 'Gross monthly income',
      type: 'currency',
      defaultValue: 7_000,
      min: 0,
      max: 10_000_000,
      step: 100,
      help: 'Pay before taxes and deductions.',
      group: 'Monthly income',
    },
    {
      name: 'otherMonthlyIncome',
      label: 'Other monthly income',
      type: 'currency',
      defaultValue: 500,
      min: 0,
      max: 10_000_000,
      step: 50,
      help: 'Regular, documentable income such as side work, alimony or rental income.',
      group: 'Monthly income',
    },
    {
      name: 'housingPayment',
      label: 'Rent or mortgage payment',
      type: 'currency',
      defaultValue: 1_900,
      min: 0,
      max: 1_000_000,
      step: 25,
      help: 'For a mortgage, include property tax, insurance and HOA dues.',
      group: 'Monthly debt payments',
    },
    {
      name: 'carLoans',
      label: 'Car loan payments',
      type: 'currency',
      defaultValue: 450,
      min: 0,
      max: 1_000_000,
      step: 25,
      group: 'Monthly debt payments',
    },
    {
      name: 'studentLoans',
      label: 'Student loan payments',
      type: 'currency',
      defaultValue: 300,
      min: 0,
      max: 1_000_000,
      step: 25,
      group: 'Monthly debt payments',
    },
    {
      name: 'creditCardMinimums',
      label: 'Credit card minimum payments',
      type: 'currency',
      defaultValue: 150,
      min: 0,
      max: 1_000_000,
      step: 25,
      help: 'The required minimums, not the balances or what you choose to pay.',
      group: 'Monthly debt payments',
    },
    {
      name: 'otherDebts',
      label: 'Other debt payments',
      type: 'currency',
      defaultValue: 0,
      min: 0,
      max: 1_000_000,
      step: 25,
      help: 'Personal loans, child support, alimony paid, or other required monthly obligations.',
      group: 'Monthly debt payments',
    },
  ],
  faqs: [
    {
      question: 'What is the difference between front-end and back-end DTI?',
      answer:
        'Front-end DTI counts only your housing payment as a share of gross monthly income. Back-end DTI counts housing plus every other required debt payment, such as car loans, student loans and credit card minimums. Lenders look at both, but the back-end ratio is the one most often quoted.',
    },
    {
      question: 'What is a good debt-to-income ratio?',
      answer:
        'A back-end ratio at or below 36% is a common conventional guideline, and 43% is a widely cited reference point from Qualified Mortgage rules. These are guidelines, not hard cutoffs: lenders and loan programs vary, and credit score, savings and down payment also matter.',
    },
    {
      question: 'Do I use gross or net income?',
      answer:
        'Gross income, before taxes and deductions. That is how lenders calculate DTI, which is also why a ratio that looks fine on paper can feel tight against your actual take-home pay.',
    },
    {
      question: 'Which expenses are not counted as debt?',
      answer:
        'Everyday living costs such as utilities, groceries, phone bills, car insurance and subscriptions are not counted. DTI only includes required payments on debts and housing, plus court-ordered obligations like child support.',
    },
    {
      question: 'How can I lower my DTI quickly?',
      answer:
        'Paying off a small loan entirely removes its whole payment from the ratio, which usually moves DTI faster than spreading extra money across several balances. Paying down credit cards lowers their minimums, and adding documented income raises the denominator.',
    },
  ],
  related: [
    'home-affordability-calculator',
    'debt-payoff-calculator',
    'credit-card-payoff-calculator',
    'rent-affordability-calculator',
  ],
  seo: {
    title: 'Debt-to-Income Ratio Calculator (DTI) | Calcxs',
    description:
      'Free DTI calculator. Find your front-end and back-end debt-to-income ratios, compare them with the 36% and 43% guidelines, and see how much debt to cut.',
    keywords: [
      'debt to income ratio calculator',
      'dti calculator',
      'front end back end ratio',
      'how to calculate debt to income ratio',
    ],
  },
}
