import type { CalculatorConfig } from './types'

export const roiConfig: CalculatorConfig = {
  slug: 'roi-calculator',
  name: 'ROI Calculator',
  shortName: 'ROI',
  category: 'investment',
  updated: '2026-10-14',
  summary: 'Calculate return on investment, annualized ROI, and break-even time.',
  inputs: [
    {
      name: 'initialInvestment',
      label: 'Initial investment',
      type: 'currency',
      defaultValue: 10_000,
      min: 0,
      max: 100_000_000,
      step: 100,
    },
    {
      name: 'finalValue',
      label: 'Final value',
      type: 'currency',
      defaultValue: 15_000,
      min: 0,
      max: 100_000_000,
      step: 100,
    },
    {
      name: 'additionalCosts',
      label: 'Additional costs',
      type: 'currency',
      defaultValue: 0,
      min: 0,
      max: 10_000_000,
      step: 50,
      help: 'Fees, commissions, or other costs incurred alongside the investment.',
    },
    {
      name: 'incomeReceived',
      label: 'Income received',
      type: 'currency',
      defaultValue: 0,
      min: 0,
      max: 10_000_000,
      step: 50,
      help: 'Dividends, rent, or interest received during the holding period.',
    },
    {
      name: 'holdingPeriodMonths',
      label: 'Holding period',
      type: 'number',
      defaultValue: 24,
      min: 0,
      max: 600,
      step: 1,
      unit: 'months',
    },
  ],
  faqs: [
    {
      question: 'How is ROI calculated?',
      answer:
        'ROI is your net profit divided by the total amount invested, expressed as a percentage: (final value + income − total invested) ÷ total invested. Total invested includes any additional costs, since those are real money spent to get the return.',
    },
    {
      question: 'What is annualized ROI, and why is it not just ROI divided by years?',
      answer:
        'Annualized ROI restates your total return as an equivalent constant yearly rate, using the compounding formula rather than simple division. Dividing a 2-year 100% return by 2 would suggest 50% a year, but the correct annualized figure is about 41.4%, because compounding means less than half the growth needs to happen each year to reach double over two years.',
    },
    {
      question: 'Why do additional costs matter for ROI?',
      answer:
        'Ignoring fees and costs overstates your real return. If you invest $10,000 and pay $500 in fees, your true outlay is $10,500 — using $10,000 as the denominator makes the investment look better than it actually performed.',
    },
    {
      question: 'What counts as income received?',
      answer:
        'Any cash the investment paid you during the holding period, separate from its change in value — dividends from stocks, rent from property, or interest from a bond, for example.',
    },
    {
      question: 'What is a good ROI?',
      answer:
        "It depends entirely on the asset class, risk, and time period involved. A 10% ROI over one month is excellent; the same 10% over ten years is poor. That's exactly why the annualized figure and holding period matter for comparing investments fairly.",
    },
  ],
  related: [
    'compound-interest-calculator',
    'investment-calculator',
    'rent-vs-buy-calculator',
    'retirement-calculator',
  ],
  seo: {
    title: 'ROI Calculator — Return on Investment & Annualized ROI | Calcxs',
    description:
      'Free ROI calculator. Calculate return on investment, annualized ROI, profit multiple, and break-even time for any investment.',
    keywords: ['roi calculator', 'return on investment calculator', 'annualized roi'],
  },
}
