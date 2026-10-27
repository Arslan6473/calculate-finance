export interface ChangelogEntry {
  /** ISO date (YYYY-MM-DD). Newest first. */
  date: string
  title: string
  changes: string[]
}

/** Public record of what changed on the site and when. Add new entries at the top. */
export const CHANGELOG: ChangelogEntry[] = [
  {
    date: '2026-10-27',
    title: 'About, contact, and FAQ updates',
    changes: [
      'Added 10 more display currencies: Pakistani rupee, Indian rupee, UAE dirham, Saudi riyal, Japanese yen, Chinese yuan, Swiss franc, New Zealand dollar, Singapore dollar, and South African rand.',
      'Added a Frequently Asked Questions section to the 15 guides that did not have one, so every guide and calculator now has an FAQ.',
      'Expanded the about page with who runs the site, why it exists, and how formulas are checked.',
      'Added a direct contact email to the contact, about, and privacy pages, and an effective date to the privacy policy.',
      'Calculator FAQ answers are now shown in full instead of in collapsed panels.',
      'Calculator pages now link to the guides that explain them.',
      "Clarified two Salary calculator FAQ answers: the effective rate shown includes FICA and state tax, so it can exceed the marginal federal rate, and some cafeteria-plan deductions such as HSA contributions are also exempt from FICA.",
    ],
  },
  {
    date: '2026-10-27',
    title: 'Nine new guides',
    changes: [
      'Published guides on whether savings rates rise with inflation, how to calculate rate of return, and the compound interest formula with step-by-step examples.',
      'Published guides on whether credit cards compound interest daily, when credit card interest starts, and how credit card interest rates are determined.',
      'Published guides on how much to borrow when trading in a car, whether $60,000 is a good down payment, and what counts as a good debt-to-income ratio by loan type.',
      'Each new guide includes worked examples, a chart, an FAQ, and official source links.',
    ],
  },
  {
    date: '2026-10-24',
    title: 'Expanded guides',
    changes: [
      'Expanded the ROI guide with more worked examples, ROI in months, Excel formulas, ROI vs. ROE, and an FAQ.',
      'Added daily compounding, other balance methods, a monthly interest estimate, and an FAQ to the credit card interest guide.',
      'Added a section on whether savings rates rise with inflation, and an FAQ, to the inflation guide.',
      'Added a comparison table and FAQ to the fixed vs. adjustable-rate mortgage guide.',
      'Added a step-by-step payment formula walkthrough to the amortization guide, quick answers and an FAQ to the $60,000 home affordability guide, and a three-step method to the debt-to-income guide.',
      "Added charts and diagrams to all 20 guides, based on each guide's own worked examples.",
    ],
  },
  {
    date: '2026-10-14',
    title: 'New calculators, guides, and sources',
    changes: [
      'Added Hourly to Salary, Pay Raise, and Overtime Pay calculators.',
      'Added Home Affordability, Rent Affordability, and Rental Property calculators.',
      'Added Auto Loan, Mortgage Refinance, Debt-to-Income, Savings Goal, Inflation, and CAGR calculators.',
      'Published 15 new guides, covering topics from debt payoff and rental property analysis to retirement planning.',
      'Added a "Common Mistakes to Avoid" section and official source links to every calculator page.',
      'Added official source links to every guide, and expanded the five original guides with more worked examples.',
      'Added an editorial policy and a last-updated date to every calculator and guide.',
      'Fixed the Rent vs Buy calculator, which understated the cost of renting by treating money the renter invested each month as a gain without counting it as money paid in. Results now favor buying somewhat more often than before.',
      "Fixed the Retirement calculator's savings target, which assumed end-of-year withdrawals while the year-by-year projection used start-of-year withdrawals. The target is now slightly higher and consistent with the projection.",
      'Corrected worked examples on the Credit Card Payoff, Rent vs Buy, Compound Interest, Investment, Loan, Debt Payoff, and Retirement pages to match the calculators exactly.',
    ],
  },
  {
    date: '2026-09-28',
    title: 'Launch',
    changes: [
      'Launched with 10 calculators: mortgage, loan, compound interest, investment, ROI, retirement, salary, debt payoff, credit card payoff, and rent vs buy.',
      'Published 5 guides on compound interest, home affordability, APR, amortization, and ROI.',
      'Salary calculator uses 2026 US federal tax brackets and FICA rates.',
    ],
  },
]
