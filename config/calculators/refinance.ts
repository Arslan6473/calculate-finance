import type { CalculatorConfig } from './types'

export const refinanceConfig: CalculatorConfig = {
  slug: 'refinance-calculator',
  name: 'Mortgage Refinance Calculator',
  shortName: 'Refinance',
  category: 'loans-mortgages',
  updated: '2026-10-14',
  summary:
    'Compare your current mortgage with a refinance: payment, break-even point and lifetime savings.',
  inputs: [
    {
      name: 'currentBalance',
      label: 'Current loan balance',
      type: 'currency',
      defaultValue: 300_000,
      min: 0,
      max: 20_000_000,
      step: 1_000,
      group: 'Current mortgage',
    },
    {
      name: 'currentRate',
      label: 'Current interest rate',
      type: 'percent',
      defaultValue: 7,
      min: 0,
      max: 25,
      step: 0.01,
      group: 'Current mortgage',
    },
    {
      name: 'remainingYears',
      label: 'Years remaining',
      type: 'years',
      defaultValue: 25,
      min: 1,
      max: 40,
      step: 1,
      unit: 'years',
      group: 'Current mortgage',
    },
    {
      name: 'newRate',
      label: 'New interest rate',
      type: 'percent',
      defaultValue: 6,
      min: 0,
      max: 25,
      step: 0.01,
      group: 'New loan',
    },
    {
      name: 'newTermYears',
      label: 'New loan term',
      type: 'select',
      defaultValue: 30,
      options: [
        { label: '30 years', value: 30 },
        { label: '20 years', value: 20 },
        { label: '15 years', value: 15 },
      ],
      group: 'New loan',
    },
    {
      name: 'closingCosts',
      label: 'Closing costs',
      type: 'currency',
      defaultValue: 6_000,
      min: 0,
      max: 1_000_000,
      step: 100,
      help: 'Lender fees, appraisal, title and any points paid on the new loan.',
      group: 'New loan',
    },
    {
      name: 'rollCostsIntoLoan',
      label: 'Roll closing costs into the loan',
      type: 'toggle',
      defaultValue: false,
      help: 'Adds the costs to the new balance instead of paying them in cash.',
      group: 'New loan',
    },
  ],
  faqs: [
    {
      question: 'How is the break-even point calculated?',
      answer:
        'Closing costs divided by the monthly payment saving, rounded up to a whole month. If refinancing costs $6,000 and saves $321.69 a month, you recover the costs in 19 months. If you expect to sell or refinance again before then, the refinance likely loses money.',
    },
    {
      question: 'Why can a lower payment still cost me more?',
      answer:
        'Because a new 30-year loan restarts the clock. If you had 25 years left, the lower payment is partly the result of spreading the balance over 5 extra years, and those extra years of interest can outweigh the lower rate. Compare lifetime net savings, not just the monthly figure.',
    },
    {
      question: 'Should I roll closing costs into the new loan?',
      answer:
        'Rolling them in avoids a cash outlay but means you borrow the costs and pay interest on them for the full term, which raises the payment and lowers lifetime savings. Paying cash is cheaper if you have it without draining your emergency fund.',
    },
    {
      question: 'Does this include taxes, insurance or PMI?',
      answer:
        'No. It compares principal and interest only, because property tax and homeowners insurance stay the same whichever loan you have. If refinancing removes or adds mortgage insurance, factor that difference in separately.',
    },
    {
      question: 'What does a shorter new term do?',
      answer:
        'A 15- or 20-year refinance usually raises or barely changes the payment, but it cuts total interest sharply because you pay the balance off sooner. The calculator shows no break-even in that case, since the saving comes at the end rather than each month.',
    },
  ],
  related: [
    'mortgage-calculator',
    'home-affordability-calculator',
    'debt-to-income-calculator',
    'rent-vs-buy-calculator',
  ],
  seo: {
    title: 'Mortgage Refinance Calculator & Break-Even | Calcxs',
    description:
      'Free mortgage refinance calculator. Compare current vs new payments, find your break-even month, and see lifetime interest savings after closing costs.',
    keywords: [
      'refinance calculator',
      'mortgage refinance calculator',
      'refinance break even calculator',
      'should i refinance',
    ],
  },
}
