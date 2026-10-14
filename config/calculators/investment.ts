import type { CalculatorConfig } from './types'

export const investmentConfig: CalculatorConfig = {
  slug: 'investment-calculator',
  name: 'Investment Calculator',
  shortName: 'Investment',
  category: 'investment',
  updated: '2026-10-14',
  summary: 'Project your portfolio growth with contributions, fees, and inflation.',
  inputs: [
    {
      name: 'initialInvestment',
      label: 'Initial investment',
      type: 'currency',
      defaultValue: 10_000,
      min: 0,
      max: 100_000_000,
      step: 500,
    },
    {
      name: 'monthlyContribution',
      label: 'Monthly contribution',
      type: 'currency',
      defaultValue: 500,
      min: 0,
      max: 1_000_000,
      step: 25,
    },
    {
      name: 'annualReturn',
      label: 'Expected annual return',
      type: 'percent',
      defaultValue: 7,
      min: -50,
      max: 50,
      step: 0.1,
    },
    {
      name: 'termYears',
      label: 'Investment period',
      type: 'years',
      defaultValue: 25,
      min: 1,
      max: 50,
      step: 1,
      unit: 'years',
    },
    {
      name: 'annualFeePercent',
      label: 'Annual fee / expense ratio',
      type: 'percent',
      defaultValue: 0.5,
      min: 0,
      max: 10,
      step: 0.05,
      group: 'Advanced',
    },
    {
      name: 'annualContributionIncrease',
      label: 'Annual contribution increase',
      type: 'percent',
      defaultValue: 0,
      min: 0,
      max: 50,
      step: 1,
      help: 'Raise your monthly contribution each year, e.g. to match a raise.',
      group: 'Advanced',
    },
    {
      name: 'inflationRate',
      label: 'Expected inflation',
      type: 'percent',
      defaultValue: 3,
      min: 0,
      max: 30,
      step: 0.1,
      help: "Used to show your final balance in today's purchasing power.",
      group: 'Advanced',
    },
  ],
  faqs: [
    {
      question: 'What return rate should I assume?',
      answer:
        'A common conservative benchmark for a diversified stock portfolio is 6-8% annually over long periods, though actual returns vary significantly year to year. This calculator projects a steady rate you choose — it does not predict the market.',
    },
    {
      question: 'Why does the fee matter so much over a long period?',
      answer:
        'Fees compound the same way returns do, except against you. A 1% annual fee does not just cost 1% of your balance each year — it costs 1% of a balance that would otherwise have kept growing, so the gap widens every year you stay invested.',
    },
    {
      question: 'What is the inflation-adjusted balance?',
      answer:
        "Your nominal balance is what your account statement will show. The inflation-adjusted (real) balance restates that number in today's purchasing power, which is a more honest way to judge whether you're actually getting ahead.",
    },
    {
      question: 'Should I increase my contribution over time?',
      answer:
        'If your income is likely to rise, escalating your contribution by a fixed percentage each year — matching typical raises — meaningfully increases your final balance without requiring a large jump in any single year.',
    },
    {
      question: 'How is this different from the compound interest calculator?',
      answer:
        'This calculator is built for investing specifically: it models fees and an escalating contribution, and reports results in inflation-adjusted terms. The compound interest calculator is a simpler tool without fees or inflation, useful for savings accounts and CDs.',
    },
  ],
  related: [
    'compound-interest-calculator',
    'retirement-calculator',
    'roi-calculator',
    'rent-vs-buy-calculator',
  ],
  seo: {
    title: 'Investment Calculator — Project Your Portfolio Growth | Calcxs',
    description:
      'Free investment calculator with contributions, fees, and inflation adjustment. Project your portfolio growth year by year.',
    keywords: ['investment calculator', 'portfolio growth calculator', 'investment return calculator'],
  },
}
