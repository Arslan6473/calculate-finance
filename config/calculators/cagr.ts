import type { CalculatorConfig } from './types'

export const cagrConfig: CalculatorConfig = {
  slug: 'cagr-calculator',
  name: 'CAGR Calculator',
  shortName: 'CAGR',
  category: 'investment',
  updated: '2026-10-14',
  summary: 'Work out the compound annual growth rate between a starting and ending value.',
  inputs: [
    {
      name: 'beginValue',
      label: 'Beginning value',
      type: 'currency',
      defaultValue: 10_000,
      min: 0,
      max: 100_000_000_000,
      step: 100,
    },
    {
      name: 'endValue',
      label: 'Ending value',
      type: 'currency',
      defaultValue: 25_000,
      min: 0,
      max: 100_000_000_000,
      step: 100,
    },
    {
      name: 'periodYears',
      label: 'Length of period',
      type: 'number',
      defaultValue: 7,
      min: 0.1,
      max: 100,
      step: 0.5,
      unit: 'years',
      help: 'Fractions are allowed — enter 2.5 for two and a half years.',
    },
  ],
  faqs: [
    {
      question: 'What is CAGR?',
      answer:
        'Compound annual growth rate is the single, constant yearly rate that would take a starting value to an ending value over a given period, assuming growth compounds each year. It smooths out the ups and downs along the way into one comparable number.',
    },
    {
      question: 'How do you calculate CAGR?',
      answer:
        'Divide the ending value by the beginning value, raise the result to the power of 1 divided by the number of years, and subtract 1. For $10,000 growing to $25,000 over 7 years: 2.5^(1/7) − 1 = 13.99% a year.',
    },
    {
      question: 'How is CAGR different from average annual return?',
      answer:
        'A simple average of yearly returns ignores compounding and overstates growth when returns vary. A 50% gain followed by a 50% loss averages 0%, but you actually end with 25% less money — a CAGR of about −13.4%. CAGR always reflects what really happened to the balance.',
    },
    {
      question: 'Can CAGR be negative?',
      answer:
        'Yes. If the ending value is below the beginning value, CAGR is negative. If the investment is wiped out entirely, CAGR is −100%. CAGR cannot be calculated from a beginning value of zero or less, or to a negative ending value.',
    },
    {
      question: 'Does CAGR account for deposits and withdrawals?',
      answer:
        'No. CAGR only compares two values, so money added or taken out during the period distorts it. Use it for a single lump sum, or for a metric like revenue, and use a money-weighted return for accounts with regular contributions.',
    },
  ],
  related: ['roi-calculator', 'investment-calculator', 'compound-interest-calculator', 'inflation-calculator'],
  seo: {
    title: 'CAGR Calculator — Compound Annual Growth Rate | Calcxs',
    description:
      'Free CAGR calculator. Enter a beginning value, ending value, and number of years to get the compound annual growth rate, total return, and a year-by-year growth path.',
    keywords: ['cagr calculator', 'compound annual growth rate calculator', 'annualized return calculator', 'growth rate calculator'],
  },
}
