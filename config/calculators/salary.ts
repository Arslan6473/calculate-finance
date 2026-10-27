import type { CalculatorConfig } from './types'

export const salaryConfig: CalculatorConfig = {
  slug: 'salary-calculator',
  name: 'Salary Calculator',
  shortName: 'Salary',
  category: 'salary-income',
  updated: '2026-10-27',
  summary: 'Estimate your take-home pay after 2026 US federal tax and FICA.',
  inputs: [
    {
      name: 'amount',
      label: 'Pay amount',
      type: 'currency',
      defaultValue: 85_000,
      min: 0,
      max: 100_000_000,
      step: 500,
    },
    {
      name: 'payBasis',
      label: 'This amount is my pay',
      type: 'select',
      defaultValue: 'annually',
      options: [
        { label: 'Per year', value: 'annually' },
        { label: 'Per month', value: 'monthly' },
        { label: 'Per hour', value: 'hourly' },
      ],
    },
    {
      name: 'hoursPerWeek',
      label: 'Hours per week',
      type: 'number',
      defaultValue: 40,
      min: 1,
      max: 100,
      step: 1,
      help: 'Only used when your pay is entered hourly.',
    },
    {
      name: 'payFrequency',
      label: 'Paycheck frequency',
      type: 'select',
      defaultValue: 'biweekly',
      options: [
        { label: 'Weekly', value: 'weekly' },
        { label: 'Every two weeks', value: 'biweekly' },
        { label: 'Twice a month', value: 'semimonthly' },
        { label: 'Monthly', value: 'monthly' },
      ],
    },
    {
      name: 'filingStatus',
      label: 'Filing status',
      type: 'select',
      defaultValue: 'single',
      options: [
        { label: 'Single', value: 'single' },
        { label: 'Married filing jointly', value: 'married' },
        { label: 'Married filing separately', value: 'marriedSeparate' },
        { label: 'Head of household', value: 'headOfHousehold' },
      ],
    },
    {
      name: 'stateTaxRate',
      label: 'State + local tax rate',
      type: 'percent',
      defaultValue: 0,
      min: 0,
      max: 25,
      step: 0.1,
      help: 'Enter your combined state and local income tax rate. This calculator covers federal tax and FICA precisely; state tax varies too much by location to model exactly, so it is applied as the flat rate you provide.',
    },
    {
      name: 'preTaxDeductions',
      label: 'Annual pre-tax deductions',
      type: 'currency',
      defaultValue: 0,
      min: 0,
      max: 1_000_000,
      step: 100,
      help: '401(k), traditional IRA, or HSA contributions that reduce your taxable income.',
      group: 'Deductions',
    },
    {
      name: 'postTaxDeductions',
      label: 'Annual post-tax deductions',
      type: 'currency',
      defaultValue: 0,
      min: 0,
      max: 1_000_000,
      step: 100,
      help: 'Roth 401(k) contributions or other deductions taken after tax.',
      group: 'Deductions',
    },
  ],
  faqs: [
    {
      question: 'What tax rules does this calculator use?',
      answer:
        "This calculator applies the actual 2026 US federal income tax brackets, the 2026 standard deduction, and both halves of FICA — 6.2% Social Security up to the annual wage base, and 1.45% Medicare (plus a 0.9% surtax at higher incomes). State and local income tax is applied as the flat rate you enter, since it varies too much by state and city to compute exactly here.",
    },
    {
      question: 'Why do I need to enter a state tax rate myself?',
      answer:
        'Federal tax follows one set of rules nationwide, but state and local income tax involves fifty different systems, some with no income tax at all and others with their own bracket structures and local surtaxes. Rather than approximate that with numbers that might be wrong for your state, you can enter your actual combined rate for an accurate result.',
    },
    {
      question: 'How do pre-tax deductions affect my paycheck?',
      answer:
        'Contributions to a traditional 401(k) reduce your taxable income before federal and state tax are calculated, which lowers your tax bill. They do not, however, reduce the wages that Social Security and Medicare tax is based on, and this calculator models that. Some other pre-tax deductions, such as health premiums or HSA contributions made through a cafeteria plan, are also exempt from FICA, so with those your actual FICA may be slightly lower than shown.',
    },
    {
      question: 'What is the difference between my marginal rate and my effective rate?',
      answer:
        'Your marginal rate is what you pay on your next dollar of income — the rate of your highest federal tax bracket. Your federal effective rate, income tax divided by gross income, is always lower than that, because earlier brackets are taxed at lower rates. The effective rate this calculator shows also includes FICA and state tax, so it can be higher than your marginal federal rate.',
    },
    {
      question: 'Does this work for hourly pay?',
      answer:
        'Yes — choose "Per hour" and enter your hours per week. The calculator converts that to an annual figure before running it through the same tax calculation as a salaried income.',
    },
  ],
  related: ['retirement-calculator', 'debt-payoff-calculator', 'loan-calculator', 'investment-calculator'],
  seo: {
    title: 'US Salary Calculator — 2026 Take-Home Pay | Calcxs',
    description:
      'Free salary calculator using real 2026 US federal tax brackets and FICA. See your take-home pay, effective tax rate, and per-paycheck amount.',
    keywords: ['salary calculator', 'take home pay calculator', 'paycheck calculator', 'net pay calculator'],
  },
}
