import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BarChart3, BookOpen, Calculator, CheckCircle2, LineChart, ShieldCheck, Zap } from 'lucide-react'

import { CALCULATORS, getCalculatorsByCategory } from '@/config/calculators'
import { CATEGORIES, type CategorySlug } from '@/config/categories'
import { GUIDES } from '@/config/guides'
import { POPULAR_CALCULATOR_SLUGS, SITE } from '@/config/site'
import { Card, CardContent } from '@/components/ui/card'
import { CARD_HOVER_CLASSES, IconBadge, getCalculatorIcon, getCategoryIcon } from '@/components/calculators/calculator-icons'

const BENEFITS = [
  { icon: CheckCircle2, title: 'Completely free', description: 'Every calculator is free to use, with no signup required.' },
  { icon: Zap, title: 'Easy to use', description: 'Clear inputs, instant results — no financial background needed.' },
  { icon: ShieldCheck, title: 'Accurate formulas', description: 'The same math lenders, advisors, and spreadsheets use.' },
  { icon: BarChart3, title: 'Detailed results', description: 'Full breakdowns, not just a single number.' },
  { icon: LineChart, title: 'Interactive charts', description: 'See how your numbers change over time, visually.' },
  { icon: Calculator, title: 'No signup required', description: 'Start calculating immediately — nothing to create or install.' },
]

export const metadata: Metadata = {
  // Kept under 60 characters so it isn't truncated in search results.
  title: { absolute: `Free Financial Calculators – Mortgage, Loan & ROI | ${SITE.name}` },
  alternates: { canonical: '/' },
}

export default function HomePage() {
  const popular = POPULAR_CALCULATOR_SLUGS.map((slug) => CALCULATORS.find((c) => c.slug === slug)).filter(
    (c): c is (typeof CALCULATORS)[number] => !!c
  )
  const populatedCategories = Object.values(CATEGORIES).filter((c) =>
    CALCULATORS.some((calc) => calc.category === c.slug)
  )

  return (
    <div>
      <section className="border-b border-line bg-surface">
        <div className="container-page py-16 text-center sm:py-24">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Financial Calculators That Make Money Decisions Easier
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-muted">{SITE.description}</p>

          <form action="/search" method="GET" className="mx-auto mt-8 max-w-lg">
            <label htmlFor="home-search" className="sr-only">
              Search calculators
            </label>
            <div className="flex items-center gap-2 rounded-md border border-line-strong bg-surface px-4 py-1 shadow-sm">
              <input
                id="home-search"
                name="q"
                type="search"
                placeholder="Search calculators…"
                className="h-11 w-full bg-transparent text-sm text-ink placeholder:text-ink-subtle focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-ink hover:bg-accent-hover"
              >
                Search
              </button>
            </div>
            <p className="mt-2 text-sm text-ink-subtle">
              Try: mortgage calculator, compound interest, ROI…
            </p>
          </form>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="mb-6 text-2xl font-semibold text-ink">Popular Calculators</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((calc) => (
            <Link key={calc.slug} href={`/calculators/${calc.slug}`} className="group">
              <Card className={CARD_HOVER_CLASSES}>
                <CardContent className="pt-5">
                  <IconBadge icon={getCalculatorIcon(calc.slug)} />
                  <p className="mt-4 text-base font-semibold text-ink">{calc.shortName}</p>
                  <p className="mt-1 text-sm text-ink-muted">{calc.summary}</p>
                  <span className="mt-3 flex items-center gap-1 text-sm font-medium text-accent">
                    Calculate <ArrowRight className="size-3.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-surface-muted py-16">
        <div className="container-page">
          <h2 className="mb-6 text-2xl font-semibold text-ink">Explore Financial Calculators</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {populatedCategories.map((category) => {
              const calcs = getCalculatorsByCategory(category.slug)
              return (
                <Link key={category.slug} href={`/category/${category.slug}`} className="group">
                  <Card className={CARD_HOVER_CLASSES}>
                    <CardContent className="flex items-start gap-4 pt-5">
                      <IconBadge icon={getCategoryIcon(category.slug as CategorySlug)} />
                      <div>
                        <p className="text-base font-semibold text-ink">{category.name}</p>
                        <p className="mt-1 text-sm text-ink-muted">{category.description}</p>
                        <p className="mt-3 text-xs font-medium text-ink-subtle">
                          {calcs.length} calculator{calcs.length === 1 ? '' : 's'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="container-page max-w-3xl py-16">
        <h2 className="mb-4 text-2xl font-semibold text-ink">
          Free Calculators for Everyday Money Decisions
        </h2>
        <div className="space-y-4 text-ink-muted">
          <p>
            {SITE.name} is a collection of free financial calculators for the questions people
            actually ask before a big money decision: what a mortgage will really cost each month,
            how much house or rent fits a budget, how long it takes to pay off a credit card, what a
            raise or an hourly wage works out to per year, and whether savings and investments are
            on track for retirement.
          </p>
          <p>
            Every calculator runs in your browser, needs no signup, and shows a full breakdown
            rather than a single number — amortization schedules, payment splits, and charts that
            show how results change over time. Below each tool you&apos;ll find a plain-language
            explanation of the formula it uses, a worked example with real numbers, and answers to
            common questions, so you can check the math and understand what drives the result.
          </p>
          <p>
            The site is written for everyday borrowers, savers, renters, home buyers, and workers —
            not finance professionals. Our{' '}
            <Link href="/guides" className="text-accent underline underline-offset-2">
              guides
            </Link>{' '}
            go deeper on topics like compound interest, APR, amortization, and paying off debt.
            Salary and tax calculations follow US federal rules; most other calculators work for any
            currency. Results are estimates for general information, not financial advice — see
            our{' '}
            <Link href="/editorial-policy" className="text-accent underline underline-offset-2">
              editorial policy
            </Link>{' '}
            for how content is researched and checked.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="mb-6 text-2xl font-semibold text-ink">Why Use {SITE.name}?</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="flex gap-3">
              <benefit.icon className="mt-0.5 size-5 shrink-0 text-accent" />
              <div>
                <p className="font-medium text-ink">{benefit.title}</p>
                <p className="mt-0.5 text-sm text-ink-muted">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-surface-muted py-16">
        <div className="container-page">
          <h2 className="mb-6 text-2xl font-semibold text-ink">Learn About Personal Finance</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GUIDES.map((guide) => (
              <Link key={guide.slug} href={`/guides/${guide.slug}`} className="group">
                <Card className={CARD_HOVER_CLASSES}>
                  <CardContent className="flex items-start gap-4 pt-5">
                    <IconBadge icon={BookOpen} />
                    <div>
                      <p className="font-semibold text-ink">{guide.title}</p>
                      <p className="mt-1 text-sm text-ink-muted">{guide.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
