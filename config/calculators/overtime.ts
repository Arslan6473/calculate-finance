import type { CalculatorConfig } from './types'

export const overtimeConfig: CalculatorConfig = {
  slug: 'overtime-calculator',
  name: 'Overtime Pay Calculator',
  shortName: 'Overtime',
  category: 'salary-income',
  updated: '2026-10-14',
  summary: 'Calculate overtime pay at time-and-a-half or double time, weekly and per year.',
  inputs: [
    {
      name: 'hourlyRate',
      label: 'Regular hourly rate',
      type: 'currency',
      defaultValue: 22,
      min: 0,
      max: 10_000,
      step: 0.5,
    },
    {
      name: 'regularHours',
      label: 'Regular hours per week',
      type: 'number',
      defaultValue: 40,
      min: 0,
      max: 168,
      step: 1,
      help: 'Under the federal FLSA, overtime starts after 40 hours in a workweek.',
    },
    {
      name: 'overtimeHours',
      label: 'Overtime hours per week',
      type: 'number',
      defaultValue: 8,
      min: 0,
      max: 128,
      step: 0.5,
    },
    {
      name: 'multiplier',
      label: 'Overtime rate',
      type: 'select',
      defaultValue: 1.5,
      options: [
        { label: 'Time and a half (1.5×)', value: 1.5 },
        { label: 'Double time (2×)', value: 2 },
      ],
    },
    {
      name: 'weeksPerYear',
      label: 'Weeks per year',
      type: 'number',
      defaultValue: 52,
      min: 0,
      max: 52,
      step: 1,
      unit: 'weeks',
      help: 'Weeks you expect to work this schedule. Used for the annual totals.',
    },
  ],
  faqs: [
    {
      question: 'How is overtime pay calculated?',
      answer:
        'Multiply your regular hourly rate by the overtime multiplier to get your overtime rate, then multiply that by your overtime hours. At $22 an hour, time and a half is $33 an hour, so 8 overtime hours pays $264 on top of your regular pay.',
    },
    {
      question: 'When am I entitled to overtime in the US?',
      answer:
        'Under the federal Fair Labor Standards Act (FLSA), non-exempt employees must be paid at least 1.5 times their regular rate for hours worked over 40 in a workweek. Some states set stricter rules — California, for example, also requires overtime for long workdays — so check your state labor department for the rules where you work. This is general information, not legal advice.',
    },
    {
      question: 'Who is exempt from overtime?',
      answer:
        'Certain salaried employees in executive, administrative, and professional roles who meet both a salary threshold and a duties test are exempt from FLSA overtime. Job title alone does not decide it. If you are unsure whether you are exempt, the US Department of Labor and your state labor agency publish guidance.',
    },
    {
      question: 'Is double time required by law?',
      answer:
        'Federal law does not require double time; it only requires time and a half. Double time comes from some state rules, union contracts, or employer policies — for example for holidays or very long shifts. Choose 2× if your employer pays it.',
    },
    {
      question: 'Is the overtime pay shown before or after tax?',
      answer:
        'Before tax. Overtime is paid as wages, so Social Security, Medicare, and income tax withholding apply to it. For tax years 2025 through 2028, federal law also allows a deduction for the premium portion of FLSA-required overtime, subject to limits and income phase-outs — check current IRS guidance to see whether it applies to you.',
    },
  ],
  related: ['hourly-to-salary-calculator', 'salary-calculator', 'raise-calculator', 'debt-payoff-calculator'],
  seo: {
    title: 'Overtime Pay Calculator — Time and a Half & Double Time | Calcxs',
    description:
      'Free overtime pay calculator. Work out your overtime rate, weekly overtime pay, and annual earnings at time and a half or double time.',
    keywords: ['overtime calculator', 'overtime pay calculator', 'time and a half calculator', 'double time calculator'],
  },
}
