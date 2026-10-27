import type { CalculatorConfig } from './types'

/**
 * The debt list itself (name/balance/rate/minimum per debt) is not a flat set of
 * scalar fields, so it is not expressed in `inputs` — the results component
 * renders its own repeatable debt-row editor. `inputs` here covers only the
 * two scalar controls that sit alongside that list. This is the one calculator
 * where the input side is genuinely non-uniform, by design.
 */
export const debtPayoffConfig: CalculatorConfig = {
  slug: 'debt-payoff-calculator',
  name: 'Debt Payoff Calculator',
  shortName: 'Debt Payoff',
  category: 'debt',
  updated: '2026-10-14',
  summary: 'Compare the snowball and avalanche strategies to pay off multiple debts fastest.',
  inputs: [
    {
      name: 'strategy',
      label: 'Payoff strategy',
      type: 'select',
      defaultValue: 'avalanche',
      options: [
        { label: 'Avalanche (highest interest first)', value: 'avalanche' },
        { label: 'Snowball (smallest balance first)', value: 'snowball' },
      ],
    },
    {
      name: 'extraMonthlyPayment',
      label: 'Extra monthly payment',
      type: 'currency',
      defaultValue: 100,
      min: 0,
      max: 100_000,
      step: 25,
      help: 'Money available each month above the sum of all minimum payments.',
    },
  ],
  faqs: [
    {
      question: 'What is the difference between snowball and avalanche?',
      answer:
        'Avalanche pays extra toward the debt with the highest interest rate first, which minimizes total interest paid — it is mathematically optimal. Snowball pays extra toward the smallest balance first, which usually costs a bit more in interest but produces a paid-off debt sooner, which many people find easier to stick with.',
    },
    {
      question: 'Why does paying off one debt speed up the others?',
      answer:
        "Once a debt is cleared, its minimum payment doesn't disappear — it rolls into the extra payment attacking the next debt. That snowballing effect is why both strategies accelerate over time, and it's the main reason either one beats paying only minimums indefinitely.",
    },
    {
      question: 'How much does the strategy choice actually matter?',
      answer:
        "It depends on your specific debts. When interest rates are similar across debts, the difference between snowball and avalanche is small. When one debt has a much higher rate than the others, avalanche can save meaningfully more — this calculator shows the exact gap for your numbers.",
    },
    {
      question: 'What if my extra payment cannot cover the interest on my debts?',
      answer:
        "If your total monthly payment does not exceed the total interest accruing across all your debts, the balance will grow every month no matter which debt you prioritize, and no payoff date exists. This calculator will tell you plainly rather than showing a misleading date.",
    },
    {
      question: 'Should I include my mortgage in this calculator?',
      answer:
        'This tool is built for revolving and installment debt you are actively trying to eliminate faster than scheduled — credit cards, personal loans, and car loans. A mortgage is usually left on its own schedule; use the Mortgage Calculator to explore extra payments there instead.',
    },
  ],
  related: [
    'credit-card-payoff-calculator',
    'loan-calculator',
    'salary-calculator',
    'compound-interest-calculator',
  ],
  seo: {
    title: 'Debt Payoff Calculator — Snowball vs Avalanche | Calcxs',
    description:
      'Free debt payoff calculator comparing the snowball and avalanche methods. See your exact payoff date and total interest for each strategy.',
    keywords: ['debt payoff calculator', 'debt snowball calculator', 'debt avalanche calculator'],
  },
}
