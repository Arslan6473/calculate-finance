export interface GuideConfig {
  slug: string
  title: string
  description: string
  /** Calculators this guide should link to in its body and "related" section. */
  relatedCalculators: string[]
  /** ISO date (YYYY-MM-DD) the content was last meaningfully revised. Shown on the page and as `dateModified`. */
  updated: string
  seo: {
    title: string
    description: string
    keywords: string[]
  }
}

/**
 * Guide registry (design decision D4). Five guides ship with full long-form
 * content at launch; the remaining brief §15 topics are architecturally a
 * drop-in `.mdx` file plus one entry here — no code changes required.
 */
export const GUIDES: GuideConfig[] = [
  {
    slug: 'how-compound-interest-works',
    updated: '2026-10-14',
    title: 'How Does Compound Interest Work?',
    description:
      'A clear explanation of compound interest, why it accelerates over time, and how compounding frequency changes the result.',
    relatedCalculators: ['compound-interest-calculator', 'investment-calculator'],
    seo: {
      title: 'How Does Compound Interest Work? Formula & Examples | Calcxs',
      description:
        'Learn how compound interest actually works, why it grows faster than simple interest, and how to use it to your advantage.',
      keywords: ['how does compound interest work', 'compound interest explained'],
    },
  },
  {
    slug: 'how-much-house-can-i-afford',
    updated: '2026-10-14',
    title: 'How Much House Can I Afford?',
    description:
      'How lenders and financial planners think about affordability, and the income, debt, and down payment rules that determine your budget.',
    relatedCalculators: ['mortgage-calculator', 'rent-vs-buy-calculator'],
    seo: {
      title: 'How Much House Can I Afford? The 28/36 Rule Explained | Calcxs',
      description:
        'A practical guide to figuring out how much home you can afford based on income, debt, and down payment.',
      keywords: ['how much house can i afford', 'home affordability'],
    },
  },
  {
    slug: 'apr-vs-interest-rate',
    updated: '2026-10-14',
    title: 'APR vs Interest Rate: What Is the Difference?',
    description:
      'Why a loan\'s APR and its interest rate are not the same number, and which one actually tells you the true cost of borrowing.',
    relatedCalculators: ['loan-calculator', 'mortgage-calculator'],
    seo: {
      title: "APR vs Interest Rate: What's the Difference? | Calcxs",
      description:
        'A clear breakdown of the difference between APR and interest rate, and why APR is the better number for comparing loans.',
      keywords: ['apr vs interest rate', 'what is apr'],
    },
  },
  {
    slug: 'how-mortgage-amortization-works',
    updated: '2026-10-24',
    title: 'How Mortgage Amortization Works',
    description:
      'Why your early mortgage payments are mostly interest, how that shifts over time, and what an amortization schedule actually shows.',
    relatedCalculators: ['mortgage-calculator', 'loan-calculator'],
    seo: {
      title: 'Mortgage Amortization & Monthly Payment Formula | Calcxs',
      description:
        'The monthly mortgage payment formula worked step by step, why early payments are mostly interest, and how to read an amortization schedule.',
      keywords: ['how does amortization work', 'mortgage amortization explained'],
    },
  },
  {
    slug: 'how-to-calculate-roi',
    updated: '2026-10-24',
    title: 'How to Calculate ROI (Return on Investment)',
    description:
      'The ROI formula, common mistakes that overstate returns, and how to annualize a return for fair comparison across time periods.',
    relatedCalculators: ['roi-calculator', 'investment-calculator'],
    seo: {
      title: 'ROI Formula: How to Calculate Return on Investment | Calcxs',
      description:
        'The ROI formula is (gain − cost) ÷ cost × 100. See step-by-step examples, how to annualize ROI, calculate it in Excel, and the mistakes that inflate returns.',
      keywords: ['how to calculate roi', 'roi formula'],
    },
  },
  {
    slug: 'how-to-convert-hourly-to-salary',
    updated: '2026-10-14',
    title: 'How to Convert Hourly Pay to an Annual Salary',
    description:
      'The 2,080-hour formula, how unpaid time off and overtime change the result, and how to compare hourly and salaried offers once benefits are counted.',
    relatedCalculators: ['hourly-to-salary-calculator', 'salary-calculator', 'overtime-calculator'],
    seo: {
      title: 'Hourly to Salary: How to Convert Your Wage (2026) | Calcxs',
      description:
        'Learn how to convert an hourly wage to an annual salary and back, account for unpaid time off and overtime, and compare job offers including benefits.',
      keywords: ['hourly to salary', 'convert hourly to salary', 'how much is hourly pay per year'],
    },
  },
  {
    slug: 'rent-vs-buy-how-to-decide',
    updated: '2026-10-14',
    title: 'Should You Rent or Buy a Home?',
    description:
      'How to compare the true costs of renting and owning, including down payment opportunity cost, transaction costs, the break-even horizon, and the price-to-rent ratio.',
    relatedCalculators: ['rent-vs-buy-calculator', 'home-affordability-calculator', 'mortgage-calculator'],
    seo: {
      title: 'Rent vs. Buy: How to Decide (With Break-Even Math) | Calcxs',
      description:
        'A practical framework for deciding whether to rent or buy: unrecoverable costs, opportunity cost, break-even years, the price-to-rent ratio, and lifestyle factors.',
      keywords: ['rent vs buy', 'should i rent or buy a house', 'price to rent ratio'],
    },
  },
  {
    slug: 'how-much-rent-can-i-afford',
    updated: '2026-10-14',
    title: 'How Much Rent Can I Afford?',
    description:
      'The 30% rule, the 50/30/20 budget, and the landlord 40x income rule explained, plus how debts and hidden costs change what rent you can really afford.',
    relatedCalculators: ['rent-affordability-calculator', 'salary-calculator', 'rent-vs-buy-calculator'],
    seo: {
      title: 'How Much Rent Can I Afford? 30% & 40x Rules | Calcxs',
      description:
        'Find a rent you can comfortably afford using the 30% rule, the 50/30/20 budget, and the 40x income rule, with debts, utilities, and move-in costs included.',
      keywords: ['how much rent can i afford', '30% rent rule', '40x rent rule'],
    },
  },
  {
    slug: 'how-to-analyze-a-rental-property',
    updated: '2026-10-14',
    title: 'How to Analyze a Rental Property',
    description:
      'How to evaluate a rental property using NOI, cap rate, cash flow, and cash-on-cash return, with realistic reserves and a fully worked example.',
    relatedCalculators: ['rental-property-calculator', 'mortgage-calculator', 'roi-calculator'],
    seo: {
      title: 'How to Analyze a Rental Property: Cap Rate & Cash Flow | Calcxs',
      description:
        'Learn to analyze a rental property step by step: net operating income, cap rate, cash flow, cash-on-cash return, the 1% rule, and expense reserves.',
      keywords: ['how to analyze a rental property', 'cap rate', 'cash on cash return', 'rental property analysis'],
    },
  },
  {
    slug: 'debt-snowball-vs-avalanche',
    updated: '2026-10-14',
    title: 'Debt Snowball vs. Debt Avalanche: Which Is Better?',
    description:
      'How the debt snowball and debt avalanche methods work, a side-by-side worked example, and how to choose between motivation and interest savings.',
    relatedCalculators: ['debt-payoff-calculator', 'credit-card-payoff-calculator', 'loan-calculator'],
    seo: {
      title: 'Debt Snowball vs Avalanche: Which Saves More? | Calcxs',
      description:
        'Compare the debt snowball and debt avalanche methods with a worked example, learn the tradeoff between quick wins and lower interest, and explore hybrid approaches.',
      keywords: ['debt snowball vs avalanche', 'debt avalanche method', 'debt snowball method'],
    },
  },
  {
    slug: 'how-to-calculate-debt-to-income-ratio',
    updated: '2026-10-24',
    title: 'How to Calculate Your Debt-to-Income Ratio',
    description:
      'The debt-to-income formula, what counts as debt, front-end vs. back-end ratios, a worked example, and how to lower your DTI before applying for a loan.',
    relatedCalculators: ['debt-to-income-calculator', 'home-affordability-calculator', 'debt-payoff-calculator'],
    seo: {
      title: 'How to Calculate Debt-to-Income Ratio (DTI) + Example | Calcxs',
      description:
        'Learn how to calculate your debt-to-income ratio step by step, which debts lenders count, what DTI limits mean for a mortgage, and how to lower yours.',
      keywords: ['how to calculate debt to income ratio', 'debt-to-income ratio', 'front-end vs back-end dti', 'dti for mortgage'],
    },
  },
  {
    slug: 'fixed-vs-adjustable-rate-mortgage',
    updated: '2026-10-24',
    title: 'Fixed vs. Adjustable-Rate Mortgage: Which Is Right for You?',
    description:
      'How fixed-rate mortgages and ARMs work, what 5/1 and 5/6 mean, how index, margin, and rate caps set your future rate, and a worst-case payment example.',
    relatedCalculators: ['mortgage-calculator', 'refinance-calculator', 'home-affordability-calculator'],
    seo: {
      title: 'Fixed vs Adjustable-Rate Mortgage: Which Is Better? | Calcxs',
      description:
        'Fixed vs. adjustable-rate mortgage compared side by side: how ARM caps, index, and margin work, a worst-case payment example, and when an ARM makes sense.',
      keywords: ['fixed vs adjustable rate mortgage', 'arm vs fixed', '5/6 arm', 'arm rate caps'],
    },
  },
  {
    slug: '15-vs-30-year-mortgage',
    updated: '2026-10-14',
    title: '15-Year vs. 30-Year Mortgage',
    description:
      'A side-by-side comparison of 15-year and 30-year mortgages: monthly payments, total interest, equity over time, and how to decide which term fits you.',
    relatedCalculators: ['mortgage-calculator', 'refinance-calculator', 'home-affordability-calculator'],
    seo: {
      title: '15 vs 30-Year Mortgage: Payments & Interest Compared | Calcxs',
      description:
        'Compare 15-year and 30-year mortgages with real numbers on payments, interest, and equity, plus the invest-the-difference argument and how to choose.',
      keywords: ['15 vs 30 year mortgage', '15 year mortgage vs 30 year', '15 year mortgage savings'],
    },
  },
  {
    slug: 'how-extra-mortgage-payments-save-interest',
    updated: '2026-10-14',
    title: 'How Extra Mortgage Payments Save Interest',
    description:
      'Why extra principal payments save so much interest, with amortization results for monthly extras, one extra payment a year, and lump-sum prepayments.',
    relatedCalculators: ['mortgage-calculator', 'loan-calculator', 'refinance-calculator'],
    seo: {
      title: 'How Much Do Extra Mortgage Payments Save? | Calcxs',
      description:
        'See how much interest and time extra mortgage payments save, why paying early matters most, and what to check before you prepay your mortgage.',
      keywords: ['extra mortgage payments', 'pay off mortgage early', 'extra principal payment', 'biweekly mortgage payments'],
    },
  },
  {
    slug: 'how-much-house-can-i-afford-on-60k',
    updated: '2026-10-24',
    title: 'How Much House Can I Afford on a $60,000 Salary?',
    description:
      'The 28/36 rule worked through on a $60,000 income, with stated assumptions and how rates, property taxes, debts, and down payment change the answer.',
    relatedCalculators: ['home-affordability-calculator', 'mortgage-calculator', 'debt-to-income-calculator'],
    seo: {
      title: 'How Much House Can I Afford on $60K a Year? (2026) | Calcxs',
      description:
        'How much house can you afford on $60,000 a year? The 28/36 rule worked through with home prices, mortgage amounts, and down payments at different rates and tax levels.',
      keywords: ['how much house can i afford on 60k', 'how much house can i afford on 60000 a year', '60k salary mortgage'],
    },
  },
  {
    slug: 'how-much-emergency-fund',
    updated: '2026-10-14',
    title: 'How Much Should You Have in an Emergency Fund?',
    description:
      'How to size an emergency fund from your essential expenses, where in the three-to-six-month range you should land, and how to build and store it.',
    relatedCalculators: ['savings-goal-calculator', 'salary-calculator', 'compound-interest-calculator'],
    seo: {
      title: 'How Much Should Be in an Emergency Fund? | Calcxs',
      description:
        'Calculate your emergency fund target from essential monthly expenses, decide between three and six months of coverage, and learn how to build it and where to keep it.',
      keywords: ['how much emergency fund', 'emergency fund calculator', 'how many months emergency fund', 'emergency savings'],
    },
  },
  {
    slug: 'how-credit-card-interest-works',
    updated: '2026-10-24',
    title: 'How Credit Card Interest Works',
    description:
      'How card issuers turn an APR into a daily rate, calculate interest on your average daily balance, and why grace periods and minimum payments matter so much.',
    relatedCalculators: ['credit-card-payoff-calculator', 'debt-payoff-calculator', 'debt-to-income-calculator'],
    seo: {
      title: "Credit Card Interest: How It's Calculated Daily | Calcxs",
      description:
        'How credit card interest is calculated: APR to daily rate, the average daily balance method, daily compounding, the grace period, and the real cost of minimum payments.',
      keywords: ['how credit card interest works', 'how is credit card interest calculated', 'average daily balance', 'credit card minimum payment'],
    },
  },
  {
    slug: 'simple-vs-compound-interest',
    updated: '2026-10-14',
    title: 'Simple vs. Compound Interest',
    description:
      'The difference between simple and compound interest, side-by-side examples over 10 to 30 years, how compounding frequency matters, and where you see each type.',
    relatedCalculators: ['compound-interest-calculator', 'investment-calculator', 'savings-goal-calculator'],
    seo: {
      title: 'Simple vs Compound Interest: Differences & Examples | Calcxs',
      description:
        'Compare simple and compound interest with worked examples, see how compounding frequency and time change the result, and learn which loans and accounts use each.',
      keywords: ['simple vs compound interest', 'simple interest vs compound interest', 'difference between simple and compound interest'],
    },
  },
  {
    slug: 'how-inflation-affects-savings',
    updated: '2026-10-24',
    title: 'How Inflation Affects Your Savings',
    description:
      'How inflation erodes purchasing power, the difference between nominal and real returns, the Rule of 72, and ways to protect your savings.',
    relatedCalculators: ['inflation-calculator', 'compound-interest-calculator', 'retirement-calculator'],
    seo: {
      title: 'How Inflation Affects Savings & How to Protect Them | Calcxs',
      description:
        'How inflation erodes the purchasing power of your savings, whether savings rates rise with inflation, real vs. nominal returns, and how I bonds and TIPS protect you.',
      keywords: ['how inflation affects savings', 'real vs nominal return', 'purchasing power', 'inflation and savings'],
    },
  },
  {
    slug: 'how-much-do-i-need-to-retire',
    updated: '2026-10-14',
    title: 'How Much Do I Need to Retire?',
    description:
      'Estimate your retirement number from expected spending, Social Security, and the 4% rule, with a worked example and the caveats that matter.',
    relatedCalculators: ['retirement-calculator', 'investment-calculator', 'inflation-calculator'],
    seo: {
      title: 'How Much Do I Need to Retire? Use the 4% Rule | Calcxs',
      description:
        'A step-by-step way to estimate how much you need to retire: income replacement, expense-based budgets, Social Security, the 4% rule and its caveats, and the monthly savings required.',
      keywords: ['how much do i need to retire', 'retirement number', '4% rule', 'how much to save for retirement'],
    },
  },
  {
    slug: 'do-savings-rates-rise-with-inflation',
    updated: '2026-10-27',
    title: 'Do Savings Rates Rise With Inflation?',
    description:
      'How inflation reaches your savings rate through the Federal Reserve and your bank, why yields usually lag behind, and how to keep your cash from losing ground.',
    relatedCalculators: ['inflation-calculator', 'compound-interest-calculator', 'savings-goal-calculator'],
    seo: {
      title: 'Do Savings Rates Rise With Inflation? Explained | Calcxs',
      description:
        'Savings rates rise with inflation only indirectly and with a lag. See how Fed rate hikes reach savings accounts, real vs. nominal returns, and accounts that track inflation.',
      keywords: ['do savings rates rise with inflation', 'savings interest rates and inflation', 'real interest rate savings', 'high yield savings inflation'],
    },
  },
  {
    slug: 'how-to-calculate-rate-of-return',
    updated: '2026-10-27',
    title: 'How to Calculate Rate of Return on an Investment',
    description:
      'The rate of return formula with dividends, how to annualize it, and how to measure returns when you add or withdraw money, with worked examples.',
    relatedCalculators: ['roi-calculator', 'cagr-calculator', 'investment-calculator'],
    seo: {
      title: 'How to Calculate Rate of Return on an Investment | Calcxs',
      description:
        'Calculate rate of return step by step: the basic formula, annualized return, money-weighted (IRR) and time-weighted returns, and real return after inflation.',
      keywords: ['how to calculate rate of return', 'rate of return formula', 'annualized rate of return', 'rate of return on investment'],
    },
  },
  {
    slug: 'compound-interest-formula',
    updated: '2026-10-27',
    title: 'The Compound Interest Formula, Step by Step',
    description:
      'Each part of the compound interest formula explained, with worked examples for annual, monthly, and continuous compounding, regular deposits, and solving for time or rate.',
    relatedCalculators: ['compound-interest-calculator', 'savings-goal-calculator', 'investment-calculator'],
    seo: {
      title: 'Compound Interest Formula: Step-by-Step Examples | Calcxs',
      description:
        'Learn the compound interest formula A = P(1 + r/n)^(nt) with step-by-step examples, monthly deposits, continuous compounding, and how to solve for time or rate.',
      keywords: ['compound interest formula', 'compound interest formula monthly', 'compound interest formula with examples', 'how to calculate compound interest'],
    },
  },
  {
    slug: 'do-credit-cards-compound-daily',
    updated: '2026-10-27',
    title: 'Do Credit Cards Compound Interest Daily?',
    description:
      'How most credit cards turn an APR into a daily rate and add interest to the balance each day, how much that really costs, and how to check your own card.',
    relatedCalculators: ['credit-card-payoff-calculator', 'debt-payoff-calculator'],
    seo: {
      title: 'Do Credit Cards Compound Daily? How Interest Is Calculated | Calcxs',
      description:
        'Most credit cards compound interest daily. See how the daily rate works, how much compounding adds to your APR, and how to find your card\'s method.',
      keywords: ['do credit cards compound daily', 'credit card interest compounded daily', 'daily periodic rate', 'credit card effective annual rate'],
    },
  },
  {
    slug: 'how-much-loan-do-i-need-trading-in-car',
    updated: '2026-10-27',
    title: 'How Much Loan Do I Need When Trading In a Car?',
    description:
      'The formula for your new car loan with a trade-in, including sales tax, fees, and positive or negative equity, with worked examples.',
    relatedCalculators: ['auto-loan-calculator', 'loan-calculator'],
    seo: {
      title: 'How Much Loan Do I Need When Trading In a Car? | Calcxs',
      description:
        'Work out how much to finance when you trade in a car: price, taxes, fees, trade-in value, loan payoff, and what negative equity does to the new loan.',
      keywords: ['how much loan do i need trading in car', 'trade in car loan calculation', 'negative equity trade in', 'car trade in equity'],
    },
  },
  {
    slug: 'when-does-credit-card-interest-start',
    updated: '2026-10-27',
    title: 'When Does Credit Card Interest Start?',
    description:
      'How the grace period works, how many interest-free days you get, what happens when you carry a balance, and which transactions start charging interest immediately.',
    relatedCalculators: ['credit-card-payoff-calculator', 'debt-payoff-calculator'],
    seo: {
      title: 'When Does Credit Card Interest Start? Grace Period Explained | Calcxs',
      description:
        'Credit card interest starts only if you carry a balance. Learn how the grace period works, when interest begins on purchases and cash advances, and how to avoid it.',
      keywords: ['when does credit card interest start', 'credit card grace period', 'when is credit card interest charged', 'residual interest'],
    },
  },
  {
    slug: 'is-60000-a-good-down-payment',
    updated: '2026-10-27',
    title: 'Is $60,000 a Good Down Payment on a House?',
    description:
      'What $60,000 covers at different home prices, how it affects PMI and your monthly payment, and whether to put all of it down.',
    relatedCalculators: ['mortgage-calculator', 'home-affordability-calculator'],
    seo: {
      title: 'Is $60,000 a Good Down Payment on a House? | Calcxs',
      description:
        '$60,000 is 20% down on a $300,000 home. See the percentage at other prices, monthly payments, PMI, and how much cash to keep for closing costs and emergencies.',
      keywords: ['is 60000 a good down payment', '60k down payment house', '60000 down payment how much house', '20 percent down payment'],
    },
  },
  {
    slug: 'good-debt-to-income-ratio',
    updated: '2026-10-27',
    title: 'What Is a Good Debt-to-Income Ratio?',
    description:
      'What counts as a good DTI and the limits for conventional, FHA, VA, USDA, and jumbo loans, with a worked example and ways to lower your ratio.',
    relatedCalculators: ['debt-to-income-calculator', 'home-affordability-calculator', 'debt-payoff-calculator'],
    seo: {
      title: 'What Is a Good Debt-to-Income Ratio? DTI by Loan Type | Calcxs',
      description:
        'A good DTI is under 36%. See the maximum debt-to-income ratio for conventional, FHA, VA, USDA, and jumbo loans, and how lenders weigh a high ratio.',
      keywords: ['good debt to income ratio', 'max dti for fha loan', 'va loan dti', 'conventional loan dti limit'],
    },
  },
  {
    slug: 'how-are-credit-card-interest-rates-determined',
    updated: '2026-10-27',
    title: 'How Are Credit Card Interest Rates Determined?',
    description:
      'How issuers set your APR from the prime rate plus a margin, what decides your margin, and the federal rules that limit rate increases.',
    relatedCalculators: ['credit-card-payoff-calculator', 'debt-payoff-calculator'],
    seo: {
      title: 'How Are Credit Card Interest Rates Determined? | Calcxs',
      description:
        'Credit card APRs are the prime rate plus a margin. Learn what sets your margin, why rates change with the Fed, and the rules on when issuers can raise your rate.',
      keywords: ['how are credit card interest rates determined', 'credit card apr prime rate', 'credit card interest rate margin', 'why is my credit card interest rate so high'],
    },
  },
]

const bySlug = new Map(GUIDES.map((g) => [g.slug, g]))

export function getGuide(slug: string): GuideConfig | undefined {
  return bySlug.get(slug)
}

/** Guides that list the given calculator among their related calculators, in registry order. */
export function getGuidesForCalculator(calculatorSlug: string): GuideConfig[] {
  return GUIDES.filter((g) => g.relatedCalculators.includes(calculatorSlug))
}
