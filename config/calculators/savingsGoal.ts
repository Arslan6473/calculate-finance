import type { CalculatorConfig } from './types'

export const savingsGoalConfig: CalculatorConfig = {
  slug: 'savings-goal-calculator',
  name: 'Savings Goal Calculator',
  shortName: 'Savings Goal',
  category: 'investment',
  updated: '2026-10-14',
  summary: 'Find the monthly deposit you need to reach a savings goal by a set date.',
  inputs: [
    {
      name: 'goalAmount',
      label: 'Savings goal',
      type: 'currency',
      defaultValue: 50_000,
      min: 0,
      max: 100_000_000,
      step: 500,
    },
    {
      name: 'currentSavings',
      label: 'Current savings',
      type: 'currency',
      defaultValue: 5_000,
      min: 0,
      max: 100_000_000,
      step: 500,
      help: 'What you have already set aside toward this goal.',
    },
    {
      name: 'termYears',
      label: 'Years to reach the goal',
      type: 'years',
      defaultValue: 10,
      min: 1,
      max: 50,
      step: 1,
      unit: 'years',
    },
    {
      name: 'annualRate',
      label: 'Annual interest or return rate',
      type: 'percent',
      defaultValue: 5,
      min: 0,
      max: 30,
      step: 0.1,
      help: 'Use your savings account APY, or a conservative estimate for an investment account. Enter 0 for cash.',
    },
    {
      name: 'compoundFrequency',
      label: 'Compounding frequency',
      type: 'select',
      defaultValue: 'monthly',
      options: [
        { label: 'Annually', value: 'annually' },
        { label: 'Semiannually', value: 'semiannually' },
        { label: 'Quarterly', value: 'quarterly' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'Daily', value: 'daily' },
      ],
    },
    {
      name: 'contributionTiming',
      label: 'Monthly deposit timing',
      type: 'select',
      defaultValue: 'end',
      options: [
        { label: 'End of each month', value: 'end' },
        { label: 'Start of each month', value: 'start' },
      ],
      help: 'Depositing at the start of the month gives each deposit one extra month of interest.',
    },
  ],
  faqs: [
    {
      question: 'How is the required monthly savings calculated?',
      answer:
        'The calculator first grows your current savings to the goal date, then works out the gap still left to fill. It divides that gap by the future value of saving one dollar a month at your rate, which gives the exact monthly deposit that closes the gap on time.',
    },
    {
      question: 'What if I already have enough saved?',
      answer:
        'If your current savings already equal or exceed the goal, the required deposit is zero. The same is true if your savings will grow past the goal on their own by the target date — the calculator tells you when that is the case.',
    },
    {
      question: 'What interest rate should I use?',
      answer:
        'For a high-yield savings account or CD, use its current APY, keeping in mind that savings rates can change. For an investment account, use a conservative estimate rather than a best-case figure, because returns are not guaranteed and can be negative in some years. Enter 0% to plan with cash alone.',
    },
    {
      question: 'Does depositing at the start of the month help?',
      answer:
        'Yes, a little. Each deposit made at the start of the month earns one extra month of interest, so the required deposit is slightly lower. At 5% the difference is less than half a percent of the payment.',
    },
    {
      question: 'Should a short-term goal be invested in stocks?',
      answer:
        'Money you need within a few years is usually kept in insured savings, money market accounts, or CDs, because a market drop right before the goal date leaves little time to recover. Longer goals can tolerate more risk in exchange for higher expected returns.',
    },
  ],
  related: ['compound-interest-calculator', 'investment-calculator', 'retirement-calculator', 'inflation-calculator'],
  seo: {
    title: 'Savings Goal Calculator — Monthly Savings Needed | Calcxs',
    description:
      'Free savings goal calculator. Enter your target, current savings, timeline, and rate to see the monthly deposit you need, plus interest earned and a growth chart.',
    keywords: ['savings goal calculator', 'how much to save per month', 'savings plan calculator', 'monthly savings calculator'],
  },
}
