# FinanceCalc — Design Spec

**Date:** 2026-08-10
**Status:** Approved
**Stack:** Next.js 16.3.0 · React 19.2.8 · TypeScript 5 · Tailwind CSS 4 · shadcn/ui · Zod 4 · Recharts 3

---

## 1. Product

A public, organic-search-driven finance calculator reference site. Not a SaaS dashboard — a
polished public utility. The content loop for every calculator is:

> free calculator → useful result → explanation → formula → worked example → related calculators → SEO content

Monetization is prepared but not populated: configuration-driven ad slots and affiliate
placements, no hard-coded providers.

## 2. Decisions taken during brainstorming

| # | Decision | Rationale |
|---|---|---|
| D1 | **Tax scope:** US federal brackets + FICA hard-coded for 2026; state/local as a user-entered rate | Auditable and testable; avoids 50 staleness-prone bracket tables while still doing real bracket math, which is what "take-home pay calculator" searchers expect |
| D2 | **Content format:** MDX prose per calculator + TS config for structure | Prose is pleasant to author and review; FAQs stay in TS so `FAQPage` JSON-LD and visible content cannot drift |
| D3 | **Interaction:** always-live, no Calculate button | Resolves the §6/§7 contradiction in the source brief. Defaults produce a real result on first paint — better for indexing and bounce. Mobile gets a sticky result bar |
| D4 | **Guides:** 5 substantial guides at launch, architecture for 10+ | Depth over breadth; remaining topics are a drop-in `.mdx` each |
| D5 | **Architecture:** declarative inputs, component results (option B) | Draws the seam where calculators are genuinely alike (input fields) and leaves freedom where they genuinely differ (result shapes, charts) |

### Explicitly deferred (YAGNI)

- URL query-string state sync / "share this calculation" — index-bloat risk, no MVP value
- All 50 US state tax tables — unlocks state paycheck pages later, not now
- The remaining ~70 calculators — architecture supports them; only 10 ship
- User accounts, saved calculations, PDF export

## 3. The calculator contract

Every calculator is exactly five files. Nothing else, ever.

```
lib/calculators/mortgage.ts                              pure engine — no React, no formatting, no currency
config/calculators/mortgage.ts                           slug, category, inputs[], faqs[], related[], seo{}
content/calculators/mortgage-calculator.mdx              prose: how-it-works, formula, worked example
components/calculators/instances/MortgageCalculator.tsx  client: results panel + charts
tests/calculators/mortgage.test.ts                       vitest against the engine
```

### 3.1 Engines

Pure functions. No imports from React, no formatting, no currency symbols.

```ts
export function calculateMortgage(input: MortgageInput): MortgageResult
```

Inputs and outputs are plain numbers. This makes §9's "keep the calculation engine
currency-agnostic" a structural property rather than a convention, and makes §26's unit-test
requirement trivial to satisfy.

Every engine is total — it returns a result for all inputs rather than throwing. Guard
behaviour is uniform and specified in §6 below.

### 3.2 Config

Config declares the input fields declaratively, because that is the part that genuinely is
uniform across all 80 calculators:

```ts
export const mortgageConfig: CalculatorConfig = {
  slug: 'mortgage-calculator',
  name: 'Mortgage Calculator',
  category: 'loans-mortgages',
  inputs: [
    { name: 'homePrice',  label: 'Home price',    type: 'currency', default: 400_000, min: 0, max: 1e9, step: 1000 },
    { name: 'termYears',  label: 'Loan term',     type: 'select',   default: 30, options: [15, 20, 30], unit: 'years' },
    { name: 'annualRate', label: 'Interest rate', type: 'percent',  default: 6.5, min: 0, max: 100, step: 0.01 },
  ],
  faqs: [...],
  related: [...],
  seo: { title, description, keywords },
}
```

A single `CalculatorForm` renders any config. Numeric keyboards (`inputMode="decimal"`),
`<label for>` wiring, `aria-describedby` help text, `aria-invalid` + error text, range
clamping and focus rings are therefore implemented **once** and correct on every calculator by
construction — §24 mobile UX and §25 accessibility handled structurally, not per page.

### 3.3 Registry

`config/calculators/index.ts` is the single source of truth. Routes, `sitemap.ts`, the search
index, category pages, homepage cards, and related-links all derive from it. Adding a
calculator makes it appear in every one of those places automatically.

A build-time assertion fails if any `related[]` or `category` slug does not resolve. This is
how §31's "no broken links" is enforced rather than hoped for.

## 4. Data flow

```
app/calculators/[slug]/page.tsx  (server component, statically rendered)
  ├─ generateStaticParams()   ← registry keys
  ├─ generateMetadata()       ← config.seo  (title, description, canonical, OG, Twitter)
  ├─ <JsonLd>                 ← WebApplication + FAQPage + BreadcrumbList
  ├─ <CalculatorWidget>       ← the ONLY client JS on the page
  │      useCalculatorState(config) → values, errors, parsed
  │      → engine(parsed) → result
  │      → <XResults result /> + lazy <XChart result />
  ├─ MDX prose                ← server-rendered HTML
  ├─ <FaqSection>             ← server, from config.faqs
  ├─ <RelatedCalculators>     ← server, from config.related
  └─ <AdSlot placement="..."> ← server
```

The client boundary is drawn tightly around the widget. Every piece of SEO content is
server-rendered static HTML — in the initial payload for crawlers, zero JS cost. Charts are
`dynamic()`-imported inside the widget behind a skeleton, keeping Recharts out of the initial
bundle. This is how §19's performance targets are met without weakening §11's content
requirements.

## 5. The ten MVP calculators

| Slug | Engine | Distinctive output |
|---|---|---|
| `mortgage-calculator` | `mortgage.ts` | payment breakdown, amortization schedule, PMI |
| `loan-calculator` | `loan.ts` | payment, total interest, schedule |
| `compound-interest-calculator` | `compoundInterest.ts` | growth series, contribution vs interest split |
| `investment-calculator` | `investment.ts` | future value, contribution schedule |
| `roi-calculator` | `roi.ts` | ROI %, annualized ROI, profit |
| `retirement-calculator` | `retirement.ts` | balance at retirement, contributions vs growth, drawdown |
| `salary-calculator` | `salary.ts` + `tax/` | gross↔net, per-period, effective + marginal rate |
| `debt-payoff-calculator` | `debtPayoff.ts` | snowball vs avalanche, payoff date, balance curve |
| `credit-card-payoff-calculator` | `creditCard.ts` | months to payoff, interest cost, minimum-payment trap |
| `rent-vs-buy-calculator` | `rentVsBuy.ts` | break-even year, cumulative cost curves |

Six categories are created (`loans-mortgages`, `investment`, `debt`, `salary-income`,
`real-estate`, `business`), each with a landing page listing its calculators. Categories with
only planned calculators show the ones that exist; no empty or thin category pages ship.

## 6. Error handling and numeric robustness

All engines share one guard policy, tested per §26:

- **Empty / `NaN` / non-finite input** → treated as `0` at the parse boundary, never propagated
- **Negative** where meaningless (principal, term, price) → clamped to `0`
- **Zero interest rate** → closed-form annuity collapses to `principal / periods`, handled as an explicit branch rather than a division by zero
- **Zero periods / zero principal** → returns a zeroed result, not `NaN` or `Infinity`
- **Extremely large values** → capped at documented ceilings (`1e12` money, `1e4` percent, 600 periods) so schedule generation cannot allocate unbounded arrays
- **Non-terminating payoff** (payment ≤ monthly interest) → returns `{ payoffPossible: false }` and the UI explains the debt will never amortize, rather than looping forever
- **Decimal precision** → all money computed in floating point, rounded only at the formatting boundary; schedules force the final row's balance to exactly `0` to absorb accumulated drift

Validation is Zod at the parse boundary (`lib/validation/`). The form shows a message per
invalid field via `aria-invalid` + `aria-describedby`; results keep showing the last valid
computation rather than blanking out.

## 7. Currency and formatting

`lib/formatting/` wraps `Intl.NumberFormat`. Supported: USD (default), EUR, GBP, CAD, AUD.
Currency is React context, persisted to `localStorage`, and passed to formatters only — never
into an engine. `$` never appears in `lib/calculators/`.

The salary calculator's tax model is US-specific and is labelled as such in the UI; it does not
offer the currency switcher.

## 8. SEO

Per calculator page: unique title and description (from config, never templated into
duplicates), canonical URL, Open Graph, Twitter card, visible breadcrumbs, and JSON-LD for
`WebApplication`, `FAQPage`, and `BreadcrumbList`. Guides emit `Article` + `BreadcrumbList`.

Schema is emitted only where it describes visible page content. No `AggregateRating`, no
reviews, no fabricated authorship.

`sitemap.ts` and `robots.ts` derive from the registries. `/search` is `noindex, follow`.

## 9. Design system

Trustworthy financial reference, not a crypto dashboard. Tailwind v4 CSS-variable tokens,
`next-themes` dark/light, one accent colour used sparingly for the primary result. Subtle
borders, generous whitespace, tabular-nums for all figures, strong typographic hierarchy. No
gradients, no decorative animation, no fake dashboards.

Result highlights are the loudest element on the page — the number the user came for.

## 10. Testing

- **Vitest** unit tests for all ten engines plus formatting, validation, and the tax module.
  Coverage per §26: normal inputs, zero rate, zero principal, invalid input, large numbers,
  decimals, and each guard in §6.
- **Registry integrity test** — every `related[]` and `category` resolves; every calculator has
  config, engine, MDX, and a results component.
- **Playwright** smoke tests for the critical flows: load a calculator and see a non-empty
  result, change an input and watch the result change, switch to yearly amortization, download
  CSV, search and navigate.

## 11. Definition of done

`npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` all clean. Ten working
calculators with real computed results, no placeholders. Sitemap, robots, JSON-LD, internal
linking, search, disclaimer, and the legal pages all present. No console errors, no broken
internal links.

## 12. Structure

```
app/                 routes: /, /calculators/[slug], /category/[slug], /guides, /guides/[slug],
                     /search, /about, /disclaimer, /privacy, /terms, /contact, sitemap.ts, robots.ts
components/          calculators/{form,shell,instances,results} charts/ seo/ navigation/ ads/ affiliate/ ui/
lib/                 calculators/ tax/ formatting/ validation/ seo/ analytics/ content/
config/              calculators/ categories/ guides/ site.ts affiliate.ts
content/             calculators/*.mdx guides/*.mdx
tests/               calculators/ e2e/
```
