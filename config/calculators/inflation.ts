import type { CalculatorConfig } from './types'

export const inflationConfig: CalculatorConfig = {
  slug: 'inflation-calculator',
  name: 'Inflation Calculator',
  shortName: 'Inflation',
  category: 'investment',
  updated: '2026-10-14',
  summary: 'See how inflation raises future prices and erodes the purchasing power of your money.',
  inputs: [
    {
      name: 'mode',
      label: 'What do you want to know?',
      type: 'select',
      defaultValue: 'future',
      options: [
        { label: 'What this amount will cost and be worth in the future', value: 'future' },
        { label: 'What this amount was equivalent to in the past', value: 'past' },
      ],
    },
    {
      name: 'amount',
      label: 'Amount in today’s dollars',
      type: 'currency',
      defaultValue: 1_000,
      min: 0,
      max: 100_000_000,
      step: 100,
    },
    {
      name: 'inflationRate',
      label: 'Annual inflation rate',
      type: 'percent',
      defaultValue: 3,
      min: -10,
      max: 50,
      step: 0.1,
      help: 'An assumed average rate applied every year. The Federal Reserve targets 2% over the longer run.',
    },
    {
      name: 'termYears',
      label: 'Number of years',
      type: 'years',
      defaultValue: 10,
      min: 1,
      max: 50,
      step: 1,
      unit: 'years',
    },
  ],
  faqs: [
    {
      question: 'How do you calculate the effect of inflation?',
      answer:
        'Multiply the amount by (1 + inflation rate) raised to the number of years. At 3% a year, something that costs $1,000 today would cost about $1,343.92 in 10 years. Dividing by the same factor gives the purchasing power of today’s money in the future: $1,000 then buys what about $744.09 buys now.',
    },
    {
      question: 'Why doesn’t this calculator use historical CPI data?',
      answer:
        'Historical tables go out of date every month and are easy to copy incorrectly, so this calculator uses an assumed average rate that you control. For exact historical comparisons, use the Consumer Price Index published by the U.S. Bureau of Labor Statistics, which is the official measure of consumer price changes.',
    },
    {
      question: 'What inflation rate should I assume?',
      answer:
        'The Federal Reserve aims for 2% inflation over the longer run, but actual inflation has run well above and below that in different periods. Many people plan with 2–3% for long horizons and test a higher rate to see how sensitive their plans are.',
    },
    {
      question: 'What is the difference between cumulative inflation and purchasing power loss?',
      answer:
        'Cumulative inflation is how much prices rise in total — 34.39% over 10 years at 3%. Purchasing power loss is how much less your money buys — about 25.59% over the same period. They differ because a 34.39% price increase means each dollar buys 1 ÷ 1.3439 of what it used to.',
    },
    {
      question: 'Can inflation be negative?',
      answer:
        'Yes. Falling prices are called deflation. Enter a negative rate to model it: future costs come out lower than today’s, and the purchasing power of your money rises.',
    },
  ],
  related: ['compound-interest-calculator', 'raise-calculator', 'retirement-calculator', 'savings-goal-calculator'],
  seo: {
    title: 'Inflation Calculator — Future Cost & Buying Power | Calcxs',
    description:
      'Free inflation calculator. See what today’s money will cost and be worth in the future, how much purchasing power you lose, and what an amount equaled in the past.',
    keywords: ['inflation calculator', 'purchasing power calculator', 'future value of money', 'cost of living increase calculator'],
  },
}
