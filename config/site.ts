export const SITE = {
  name: 'Calcxs',
  tagline: 'Financial calculators that make money decisions easier.',
  description:
    'Free calculators for mortgages, loans, investments, savings, retirement, debt, salary, and more.',
  /** Used to build absolute URLs for metadata, sitemap, and JSON-LD. Override with NEXT_PUBLIC_SITE_URL in production. */
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.calcxs.site',
  disclaimerShort:
    'Results are estimates for general informational purposes only, not financial, investment, tax, or legal advice.',
} as const

export const NAV_LINKS = [
  { label: 'Calculators', href: '/calculators' },
  { label: 'Loans', href: '/category/loans-mortgages' },
  { label: 'Investments', href: '/category/investment' },
  { label: 'Debt', href: '/category/debt' },
  { label: 'Salary', href: '/category/salary-income' },
  { label: 'Real Estate', href: '/category/real-estate' },
  { label: 'Guides', href: '/guides' },
] as const

/** Featured on the homepage and in the footer. Order is deliberate — highest search-intent first. */
export const POPULAR_CALCULATOR_SLUGS = [
  'mortgage-calculator',
  'compound-interest-calculator',
  'loan-calculator',
  'investment-calculator',
  'retirement-calculator',
  'salary-calculator',
  'debt-payoff-calculator',
  'roi-calculator',
] as const

export const FOOTER_LEGAL_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Disclaimer', href: '/disclaimer' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Contact', href: '/contact' },
] as const
