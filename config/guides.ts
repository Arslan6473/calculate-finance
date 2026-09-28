export interface GuideConfig {
  slug: string
  title: string
  description: string
  /** Calculators this guide should link to in its body and "related" section. */
  relatedCalculators: string[]
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
    title: 'How Does Compound Interest Work?',
    description:
      'A clear explanation of compound interest, why it accelerates over time, and how compounding frequency changes the result.',
    relatedCalculators: ['compound-interest-calculator', 'investment-calculator'],
    seo: {
      title: 'How Does Compound Interest Work? | Calcxs Guides',
      description:
        'Learn how compound interest actually works, why it grows faster than simple interest, and how to use it to your advantage.',
      keywords: ['how does compound interest work', 'compound interest explained'],
    },
  },
  {
    slug: 'how-much-house-can-i-afford',
    title: 'How Much House Can I Afford?',
    description:
      'How lenders and financial planners think about affordability, and the income, debt, and down payment rules that determine your budget.',
    relatedCalculators: ['mortgage-calculator', 'rent-vs-buy-calculator'],
    seo: {
      title: 'How Much House Can I Afford? | Calcxs Guides',
      description:
        'A practical guide to figuring out how much home you can afford based on income, debt, and down payment.',
      keywords: ['how much house can i afford', 'home affordability'],
    },
  },
  {
    slug: 'apr-vs-interest-rate',
    title: 'APR vs Interest Rate: What Is the Difference?',
    description:
      'Why a loan\'s APR and its interest rate are not the same number, and which one actually tells you the true cost of borrowing.',
    relatedCalculators: ['loan-calculator', 'mortgage-calculator'],
    seo: {
      title: 'APR vs Interest Rate: What Is the Difference? | Calcxs Guides',
      description:
        'A clear breakdown of the difference between APR and interest rate, and why APR is the better number for comparing loans.',
      keywords: ['apr vs interest rate', 'what is apr'],
    },
  },
  {
    slug: 'how-mortgage-amortization-works',
    title: 'How Mortgage Amortization Works',
    description:
      'Why your early mortgage payments are mostly interest, how that shifts over time, and what an amortization schedule actually shows.',
    relatedCalculators: ['mortgage-calculator', 'loan-calculator'],
    seo: {
      title: 'How Mortgage Amortization Works | Calcxs Guides',
      description:
        'Understand how mortgage amortization works, why interest dominates early payments, and how extra payments change your schedule.',
      keywords: ['how does amortization work', 'mortgage amortization explained'],
    },
  },
  {
    slug: 'how-to-calculate-roi',
    title: 'How to Calculate ROI (Return on Investment)',
    description:
      'The ROI formula, common mistakes that overstate returns, and how to annualize a return for fair comparison across time periods.',
    relatedCalculators: ['roi-calculator', 'investment-calculator'],
    seo: {
      title: 'How to Calculate ROI (Return on Investment) | Calcxs Guides',
      description:
        'Learn the ROI formula, how to account for costs and income correctly, and how to annualize returns for fair comparison.',
      keywords: ['how to calculate roi', 'roi formula'],
    },
  },
]

const bySlug = new Map(GUIDES.map((g) => [g.slug, g]))

export function getGuide(slug: string): GuideConfig | undefined {
  return bySlug.get(slug)
}
