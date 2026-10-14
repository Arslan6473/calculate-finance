import type { CalculatorConfig } from './types'

export const rentAffordabilityConfig: CalculatorConfig = {
  slug: 'rent-affordability-calculator',
  name: 'Rent Affordability Calculator',
  shortName: 'Rent Affordability',
  category: 'real-estate',
  updated: '2026-10-14',
  summary: 'See how much rent you can afford under the 30% rule, 50/30/20 budget, and landlord 40× rule.',
  inputs: [
    {
      name: 'grossIncome',
      label: 'Gross income',
      type: 'currency',
      defaultValue: 60_000,
      min: 0,
      max: 100_000_000,
      step: 500,
      help: 'Income before tax. Choose below whether this is per year or per month.',
      group: 'Income',
    },
    {
      name: 'incomeFrequency',
      label: 'Income is',
      type: 'select',
      defaultValue: 'annual',
      options: [
        { label: 'Per year', value: 'annual' },
        { label: 'Per month', value: 'monthly' },
      ],
      group: 'Income',
    },
    {
      name: 'takeHomePercent',
      label: 'Take-home pay',
      type: 'percent',
      defaultValue: 75,
      min: 1,
      max: 100,
      step: 1,
      help: 'Your pay after tax as a share of gross. Used only for the 50/30/20 view.',
      group: 'Income',
    },
    {
      name: 'monthlyDebts',
      label: 'Monthly debt payments',
      type: 'currency',
      defaultValue: 400,
      min: 0,
      max: 1_000_000,
      step: 25,
      help: 'Minimum payments on car loans, student loans and credit cards.',
      group: 'Spending',
    },
    {
      name: 'monthlyEssentials',
      label: 'Other monthly essentials',
      type: 'currency',
      defaultValue: 0,
      min: 0,
      max: 1_000_000,
      step: 25,
      help: 'Groceries, utilities, transport, insurance. Adding these makes the 50/30/20 view realistic.',
      group: 'Spending',
    },
    {
      name: 'rentSharePercent',
      label: 'Target rent share',
      type: 'percent',
      defaultValue: 30,
      min: 1,
      max: 100,
      step: 1,
      help: 'The share of gross monthly income you are willing to put toward rent.',
      group: 'Spending',
    },
  ],
  faqs: [
    {
      question: 'Where does the 30% rule come from?',
      answer:
        'It dates back to US public-housing policy, which capped rent at a share of income — eventually 30%. It became a popular rule of thumb, but it ignores how much you earn, where you live, and what else you owe, so treat it as a starting point rather than a verdict.',
    },
    {
      question: 'What is the 40× rent rule?',
      answer:
        'Many landlords and property managers require annual gross income of at least 40 times the monthly rent. For a $1,500 apartment that is $60,000 a year. Mathematically it is the same as rent at 30% of gross monthly income, which is why the two figures match. Some landlords in expensive markets use 40× and accept a guarantor if you fall short.',
    },
    {
      question: 'How does the 50/30/20 budget apply to rent?',
      answer:
        'The 50/30/20 budget splits take-home pay into 50% for needs, 30% for wants and 20% for saving and debt paydown beyond minimums. Rent is a need, so it has to fit in the 50% bucket alongside minimum debt payments and other essentials. Enter those essentials to see how much of the needs bucket is actually left for rent.',
    },
    {
      question: 'Why is the recommended figure the lowest of the four?',
      answer:
        'Each rule looks at affordability from a different angle. Choosing the lowest gives a figure that every rule agrees is affordable — useful if you want room for savings and surprises. You may reasonably go above it if your other costs are low or rent is unusually high where you live.',
    },
    {
      question: 'Should utilities count toward my rent budget?',
      answer:
        'If utilities are included in the rent, yes — compare the full amount. If you pay them separately, add them to "Other monthly essentials" so the 50/30/20 view accounts for them, and remember the 30% and 40× figures do not.',
    },
  ],
  related: [
    'rent-vs-buy-calculator',
    'home-affordability-calculator',
    'salary-calculator',
    'debt-payoff-calculator',
  ],
  seo: {
    title: 'Rent Affordability Calculator — How Much Rent Can I Afford? | Calcxs',
    description:
      'Free rent affordability calculator comparing the 30% rule, the 50/30/20 budget, and the landlord 40× income rule, adjusted for your monthly debts.',
    keywords: [
      'rent affordability calculator',
      'how much rent can i afford',
      '30 percent rent rule',
      '40x rent rule',
    ],
  },
}
