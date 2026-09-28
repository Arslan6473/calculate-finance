/**
 * Affiliate placements are configuration-driven and empty by default (brief
 * §16: "Do not hard-code affiliate providers initially"). Populating this array
 * is enough to make `<AffiliateCard>` slots render on the calculators listed —
 * no component changes required.
 */

export type AffiliateCategory =
  | 'mortgage-providers'
  | 'banks'
  | 'investment-platforms'
  | 'credit-cards'
  | 'personal-finance-apps'
  | 'insurance'
  | 'tax-software'

export interface AffiliatePlacement {
  id: string
  category: AffiliateCategory
  name: string
  description: string
  href: string
  /** Calculator slugs this placement is relevant to. Empty means site-wide. */
  showOnCalculators: string[]
}

export const AFFILIATE_PLACEMENTS: AffiliatePlacement[] = []
