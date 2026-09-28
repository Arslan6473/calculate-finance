import { describe, expect, it } from 'vitest'
import {
  CALCULATORS,
  assertRegistryIntegrity,
  getCalculator,
  getCalculatorsByCategory,
  getPopulatedCategorySlugs,
  getRelatedCalculators,
} from '@/config/calculators'
import { CATEGORIES } from '@/config/categories'

describe('calculator registry', () => {
  it('passes the integrity check', () => {
    expect(() => assertRegistryIntegrity()).not.toThrow()
  })

  it('has ten MVP calculators, each with a unique slug', () => {
    expect(CALCULATORS).toHaveLength(10)
    const slugs = new Set(CALCULATORS.map((c) => c.slug))
    expect(slugs.size).toBe(10)
  })

  it('resolves every related slug to a real calculator', () => {
    for (const config of CALCULATORS) {
      const related = getRelatedCalculators(config)
      expect(related).toHaveLength(config.related.length)
    }
  })

  it('never lists a calculator as related to itself', () => {
    for (const config of CALCULATORS) {
      expect(config.related).not.toContain(config.slug)
    }
  })

  it('assigns every calculator to a category that exists', () => {
    for (const config of CALCULATORS) {
      expect(config.category in CATEGORIES).toBe(true)
    }
  })

  it('gives every calculator at least 3 FAQs and at least one input', () => {
    for (const config of CALCULATORS) {
      expect(config.faqs.length).toBeGreaterThanOrEqual(3)
      expect(config.inputs.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('gives every calculator unique SEO title and description across the registry', () => {
    const titles = new Set(CALCULATORS.map((c) => c.seo.title))
    const descriptions = new Set(CALCULATORS.map((c) => c.seo.description))
    expect(titles.size).toBe(CALCULATORS.length)
    expect(descriptions.size).toBe(CALCULATORS.length)
  })

  it('looks up a calculator by slug', () => {
    expect(getCalculator('mortgage-calculator')?.name).toBe('Mortgage Calculator')
    expect(getCalculator('does-not-exist')).toBeUndefined()
  })

  it('lists calculators by category', () => {
    const loans = getCalculatorsByCategory('loans-mortgages')
    expect(loans.map((c) => c.slug)).toEqual(
      expect.arrayContaining(['mortgage-calculator', 'loan-calculator'])
    )
  })

  it('excludes categories with zero calculators from the populated list', () => {
    const populated = getPopulatedCategorySlugs()
    expect(populated).not.toContain('business')
    expect(populated).toContain('loans-mortgages')
  })
})
