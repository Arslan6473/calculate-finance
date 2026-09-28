import type { CalculatorConfig } from './types'

export const creditCardConfig: CalculatorConfig = {
  slug: 'credit-card-payoff-calculator',
  name: 'Credit Card Payoff Calculator',
  shortName: 'Credit Card Payoff',
  category: 'debt',
  summary: 'See how long a credit card balance takes to pay off, and the minimum-payment trap.',
  inputs: [
    {
      name: 'balance',
      label: 'Current balance',
      type: 'currency',
      defaultValue: 5_000,
      min: 0,
      max: 500_000,
      step: 100,
    },
    {
      name: 'annualRate',
      label: 'APR',
      type: 'percent',
      defaultValue: 22,
      min: 0,
      max: 60,
      step: 0.01,
    },
    {
      name: 'paymentMode',
      label: 'Payment plan',
      type: 'select',
      defaultValue: 'fixed',
      options: [
        { label: 'A fixed amount I choose', value: 'fixed' },
        { label: "The card's minimum payment", value: 'minimum' },
      ],
    },
    {
      name: 'fixedPayment',
      label: 'Monthly payment',
      type: 'currency',
      defaultValue: 250,
      min: 0,
      max: 500_000,
      step: 10,
      help: 'Used when paying a fixed amount each month.',
    },
    {
      name: 'minimumPercent',
      label: 'Minimum payment percentage',
      type: 'percent',
      defaultValue: 2,
      min: 0.5,
      max: 10,
      step: 0.1,
      help: "Your card's minimum, typically 1-3% of the balance.",
      group: 'Minimum payment plan',
    },
    {
      name: 'minimumFloor',
      label: 'Minimum payment floor',
      type: 'currency',
      defaultValue: 25,
      min: 0,
      max: 500,
      step: 5,
      help: "The smallest minimum payment your card charges, regardless of balance.",
      group: 'Minimum payment plan',
    },
    {
      name: 'monthlyPurchases',
      label: 'New monthly purchases',
      type: 'currency',
      defaultValue: 0,
      min: 0,
      max: 100_000,
      step: 50,
      help: 'Ongoing spending added to the card each month, if any.',
      group: 'Advanced',
    },
  ],
  faqs: [
    {
      question: 'Why does paying only the minimum take so long?',
      answer:
        'Credit card minimum payments are usually calculated as a percentage of your current balance, so as the balance shrinks, the required payment shrinks with it. That means an ever-smaller share of each payment goes to principal over time, which is why minimum-only payoff can take decades and cost more in interest than the original balance — this is called the minimum-payment trap.',
    },
    {
      question: 'How much faster is a fixed payment than the minimum?',
      answer:
        "Often dramatically faster. Because a fixed payment does not shrink as your balance falls, an ever-larger share of it goes to principal each month. This calculator shows both plans side by side so you can see the exact difference for your balance and rate.",
    },
    {
      question: 'What if my payment does not cover the interest?',
      answer:
        "If your monthly payment is at or below the interest charged that month, your balance will never decrease — it can even grow. This calculator will report that your balance cannot be paid off at the entered payment amount rather than showing a misleading payoff date.",
    },
    {
      question: 'Does adding new purchases change the payoff time?',
      answer:
        "Yes — any ongoing spending you add to the card each month competes with your payment for reducing the balance, and can significantly extend how long it takes to reach zero, or prevent payoff entirely if it is large enough relative to your payment.",
    },
    {
      question: 'What APR should I use?',
      answer:
        'Use the purchase APR shown on your most recent statement. If you have carried a promotional rate that is about to expire, run the calculation again with the higher rate to see how much your payoff time and cost will change.',
    },
  ],
  related: [
    'debt-payoff-calculator',
    'loan-calculator',
    'salary-calculator',
    'compound-interest-calculator',
  ],
  seo: {
    title: 'Credit Card Payoff Calculator — Avoid the Minimum-Payment Trap | Calcxs',
    description:
      'Free credit card payoff calculator. See exactly how long your balance takes to pay off and how much a fixed payment saves versus the minimum.',
    keywords: [
      'credit card payoff calculator',
      'credit card interest calculator',
      'minimum payment calculator',
    ],
  },
}
