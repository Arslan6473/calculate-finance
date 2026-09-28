import type { CalculatorConfig } from './types'

export const compoundInterestConfig: CalculatorConfig = {
  slug: 'compound-interest-calculator',
  name: 'Compound Interest Calculator',
  shortName: 'Compound Interest',
  category: 'investment',
  summary: 'See how your savings grow with compound interest and regular contributions.',
  inputs: [
    {
      name: 'principal',
      label: 'Initial deposit',
      type: 'currency',
      defaultValue: 5_000,
      min: 0,
      max: 100_000_000,
      step: 500,
    },
    {
      name: 'annualRate',
      label: 'Annual interest rate',
      type: 'percent',
      defaultValue: 6,
      min: -20,
      max: 50,
      step: 0.1,
    },
    {
      name: 'termYears',
      label: 'Time period',
      type: 'years',
      defaultValue: 20,
      min: 1,
      max: 50,
      step: 1,
      unit: 'years',
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
      name: 'contribution',
      label: 'Recurring contribution',
      type: 'currency',
      defaultValue: 200,
      min: 0,
      max: 1_000_000,
      step: 25,
    },
    {
      name: 'contributionFrequency',
      label: 'Contribution frequency',
      type: 'select',
      defaultValue: 'monthly',
      options: [
        { label: 'Monthly', value: 'monthly' },
        { label: 'Quarterly', value: 'quarterly' },
        { label: 'Annually', value: 'annually' },
      ],
    },
  ],
  faqs: [
    {
      question: 'How does compound interest work?',
      answer:
        'Compound interest is interest earned on both your original deposit and on interest you have already earned. Each compounding period adds interest to the balance, and the next period earns interest on that larger balance — which is why growth accelerates over time rather than staying flat.',
    },
    {
      question: 'Does compounding frequency matter?',
      answer:
        'Yes. At the same annual rate, more frequent compounding (daily or monthly versus annually) produces a slightly higher return, because interest starts earning its own interest sooner. The effect is real but modest compared to the rate itself or the length of time invested.',
    },
    {
      question: 'How much difference do regular contributions make?',
      answer:
        'Substantial. Adding a fixed amount on a regular schedule means every contribution gets its own head start compounding, which is usually a bigger driver of the final balance than the interest rate for long time horizons.',
    },
    {
      question: 'What interest rate should I use?',
      answer:
        'Use the actual rate for a savings account or CD, or a conservative estimate of expected returns for an investment account. This calculator does not predict market performance — it shows the mathematical result of a rate you choose.',
    },
    {
      question: 'Can this handle a negative rate?',
      answer:
        'Yes — entering a negative rate models a balance that shrinks over time, such as an account eaten away by fees exceeding interest.',
    },
  ],
  related: ['investment-calculator', 'retirement-calculator', 'roi-calculator', 'loan-calculator'],
  seo: {
    title: 'Compound Interest Calculator — See Your Savings Grow | Calcxs',
    description:
      'Free compound interest calculator with contributions. See exactly how your money grows with a year-by-year breakdown and chart.',
    keywords: ['compound interest calculator', 'savings calculator', 'interest calculator'],
  },
}
