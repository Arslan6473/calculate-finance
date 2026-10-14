import type { CalculatorConfig } from './types'

export const raiseConfig: CalculatorConfig = {
  slug: 'raise-calculator',
  name: 'Pay Raise Calculator',
  shortName: 'Pay Raise',
  category: 'salary-income',
  updated: '2026-10-14',
  summary: 'See your new salary after a raise and whether it beats inflation.',
  inputs: [
    {
      name: 'currentSalary',
      label: 'Current annual salary',
      type: 'currency',
      defaultValue: 60_000,
      min: 0,
      max: 100_000_000,
      step: 500,
    },
    {
      name: 'raiseType',
      label: 'My raise is given as',
      type: 'select',
      defaultValue: 'percent',
      options: [
        { label: 'A percentage', value: 'percent' },
        { label: 'A dollar amount per year', value: 'amount' },
      ],
    },
    {
      name: 'raisePercent',
      label: 'Raise percentage',
      type: 'percent',
      defaultValue: 4,
      min: 0,
      max: 500,
      step: 0.1,
      help: 'Only used when your raise is given as a percentage.',
    },
    {
      name: 'raiseAmount',
      label: 'Raise amount per year',
      type: 'currency',
      defaultValue: 2_500,
      min: 0,
      max: 10_000_000,
      step: 100,
      help: 'Only used when your raise is given as a dollar amount.',
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
      name: 'inflationRate',
      label: 'Inflation rate',
      type: 'percent',
      defaultValue: 3,
      min: 0,
      max: 30,
      step: 0.1,
      help: 'Optional. Used to show whether your raise outpaces rising prices. Set to 0 to ignore inflation.',
    },
  ],
  faqs: [
    {
      question: 'How do I calculate a raise percentage?',
      answer:
        'Divide the raise amount by your old salary and multiply by 100. A $3,000 raise on a $60,000 salary is 3,000 ÷ 60,000 = 5%. Enter the raise as a dollar amount and the calculator works out the percentage for you.',
    },
    {
      question: 'What is a real, inflation-adjusted raise?',
      answer:
        'It is the raise measured in purchasing power. If your pay rises 4% but prices rise 3%, your money only goes about 1% further than before. The exact figure is (1 + raise) ÷ (1 + inflation) − 1, which for that example is about 0.97%.',
    },
    {
      question: 'Why not just subtract inflation from my raise?',
      answer:
        'Subtracting is a reasonable shortcut when both numbers are small, but it slightly overstates the real gain, and the gap widens as rates rise. This calculator uses the exact formula so the result stays accurate at any rate.',
    },
    {
      question: 'Does the per-paycheck increase include tax?',
      answer:
        'No. All figures are gross, before tax. Part of any raise goes to income tax and FICA, so the increase in your take-home pay will be smaller. Run your old and new salary through the salary calculator to see the after-tax difference.',
    },
    {
      question: 'What counts as a good raise?',
      answer:
        'At a minimum, a raise that matches inflation keeps your purchasing power level — anything below that is effectively a pay cut. Beyond that, what is typical varies by employer, industry, and year, so compare against figures for your own field rather than a single national number.',
    },
  ],
  related: ['salary-calculator', 'hourly-to-salary-calculator', 'investment-calculator', 'retirement-calculator'],
  seo: {
    title: 'Pay Raise Calculator — New Salary and Real Raise | Calcxs',
    description:
      'Free pay raise calculator. Enter a raise as a percentage or dollar amount to see your new salary, per-paycheck increase, and inflation-adjusted raise.',
    keywords: ['raise calculator', 'pay raise calculator', 'salary increase calculator', 'raise percentage calculator'],
  },
}
