import type { CalculatorConfig } from './types'

export const hourlyToSalaryConfig: CalculatorConfig = {
  slug: 'hourly-to-salary-calculator',
  name: 'Hourly to Salary Calculator',
  shortName: 'Hourly to Salary',
  category: 'salary-income',
  updated: '2026-10-14',
  summary: 'Convert an hourly wage to an annual salary, or a salary back to an hourly rate.',
  inputs: [
    {
      name: 'direction',
      label: 'I know my',
      type: 'select',
      defaultValue: 'hourly',
      options: [
        { label: 'Hourly rate', value: 'hourly' },
        { label: 'Annual salary', value: 'annual' },
      ],
    },
    {
      name: 'hourlyRate',
      label: 'Hourly rate',
      type: 'currency',
      defaultValue: 25,
      min: 0,
      max: 10_000,
      step: 0.5,
      help: 'Only used when you know your hourly rate.',
    },
    {
      name: 'annualSalary',
      label: 'Annual salary',
      type: 'currency',
      defaultValue: 60_000,
      min: 0,
      max: 100_000_000,
      step: 500,
      help: 'Only used when you know your annual salary.',
    },
    {
      name: 'hoursPerWeek',
      label: 'Hours per week',
      type: 'number',
      defaultValue: 40,
      min: 1,
      max: 100,
      step: 1,
    },
    {
      name: 'daysPerWeek',
      label: 'Days per week',
      type: 'number',
      defaultValue: 5,
      min: 1,
      max: 7,
      step: 1,
      help: 'Only used for the daily pay figure.',
    },
    {
      name: 'unpaidWeeksOff',
      label: 'Unpaid weeks off per year',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 51,
      step: 1,
      unit: 'weeks',
      help: 'Leave at 0 if your vacation and holidays are paid. Each unpaid week removes one week of pay from the year.',
    },
  ],
  faqs: [
    {
      question: 'How do I convert an hourly wage to an annual salary?',
      answer:
        'Multiply your hourly rate by the hours you work each week, then by the number of weeks you are paid in a year. For a full-time schedule of 40 hours a week and 52 paid weeks, that is 2,080 hours — so $25 an hour works out to $52,000 a year.',
    },
    {
      question: 'Why does the calculator ask about unpaid weeks off?',
      answer:
        'Many hourly jobs do not pay for vacation or holidays. If you take two unpaid weeks a year, you are only paid for 50 weeks, and a simple "hourly × 2,080" conversion would overstate your yearly income. Salaried employees with paid time off can leave this at zero.',
    },
    {
      question: 'Is the result before or after tax?',
      answer:
        'Before tax. Every figure here is gross pay. To see what lands in your bank account after federal income tax, Social Security, and Medicare, enter the same pay in the salary calculator.',
    },
    {
      question: 'Why is my weekly pay times 52 more than my annual salary?',
      answer:
        'Weekly, biweekly, and daily figures show what you earn in a period you actually work. If you have unpaid weeks off, those weeks earn nothing, so the annual total is lower than a working week multiplied by 52. The monthly figure is your annual pay averaged over twelve months.',
    },
    {
      question: 'Is a salary or an hourly wage better?',
      answer:
        'It depends on the hours. Non-exempt hourly workers are usually entitled to overtime pay for long weeks, while a salary pays the same regardless of hours worked. Converting a salary offer to an hourly rate at the hours you expect to actually work makes the two easier to compare.',
    },
  ],
  related: ['salary-calculator', 'overtime-calculator', 'raise-calculator', 'rent-affordability-calculator'],
  seo: {
    title: 'Hourly to Salary Calculator — Convert Wage to Annual Pay | Calcxs',
    description:
      'Free hourly to salary calculator. Convert an hourly wage to annual pay or a salary to an hourly rate, with monthly, biweekly, weekly, and daily figures.',
    keywords: [
      'hourly to salary calculator',
      'hourly to annual salary',
      'salary to hourly calculator',
      'hourly wage converter',
    ],
  },
}
