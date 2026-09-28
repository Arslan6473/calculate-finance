import type { LucideIcon } from 'lucide-react'
import {
  Briefcase,
  Building2,
  Calculator,
  CreditCard,
  Home,
  Landmark,
  LineChart,
  Percent,
  PiggyBank,
  TrendingUp,
  Wallet,
} from 'lucide-react'

import type { CategorySlug } from '@/config/categories'

/**
 * Shared icon lookup so every listing of calculators or categories — home,
 * /calculators, /category/[slug], related-calculators, search — gets the
 * same visual identity per calculator/category rather than each page
 * inventing its own mapping.
 */
const CALCULATOR_ICONS: Record<string, LucideIcon> = {
  'mortgage-calculator': Home,
  'compound-interest-calculator': TrendingUp,
  'loan-calculator': Landmark,
  'investment-calculator': LineChart,
  'retirement-calculator': PiggyBank,
  'salary-calculator': Wallet,
  'debt-payoff-calculator': CreditCard,
  'credit-card-payoff-calculator': CreditCard,
  'roi-calculator': Percent,
  'rent-vs-buy-calculator': Building2,
}

const CATEGORY_ICONS: Record<CategorySlug, LucideIcon> = {
  'loans-mortgages': Home,
  investment: TrendingUp,
  debt: CreditCard,
  'salary-income': Wallet,
  'real-estate': Building2,
  business: Briefcase,
}

export function getCalculatorIcon(slug: string): LucideIcon {
  return CALCULATOR_ICONS[slug] ?? Calculator
}

export function getCategoryIcon(slug: CategorySlug): LucideIcon {
  return CATEGORY_ICONS[slug] ?? Calculator
}

/** A colored icon badge used as the visual anchor on every calculator/category card. */
export function IconBadge({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span className={`flex size-10 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent ${className ?? ''}`}>
      <Icon className="size-5" />
    </span>
  )
}

/** Shared hover treatment for every card that links somewhere — lift, accent border, deeper shadow. */
export const CARD_HOVER_CLASSES =
  'h-full transition-all group-hover:-translate-y-0.5 group-hover:border-accent group-hover:shadow-md'
