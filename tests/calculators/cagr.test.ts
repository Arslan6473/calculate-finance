import { describe, expect, it } from 'vitest'
import { calculateCagrDetails } from '@/lib/calculators/cagr'
import { calculateCagr } from '@/lib/calculators/roi'

describe('calculateCagrDetails', () => {
  it('computes CAGR, total return, and gain (worked example in the article)', () => {
    const result = calculateCagrDetails({ beginValue: 10_000, endValue: 25_000, periodYears: 7 })
    expect(result.isValid).toBe(true)
    // 2.5^(1/7) − 1 = 0.13985…
    expect(result.cagr).toBe(13.99)
    expect(result.totalReturn).toBe(150)
    expect(result.absoluteGain).toBe(15_000)
    expect(result.multiple).toBe(2.5)
    expect(result.isGain).toBe(true)
    expect(result.path).toHaveLength(8)
    expect(result.path[1].value).toBe(11_398.52)
    expect(result.path[3].value).toBe(14_809.68)
    expect(result.path[7].value).toBe(25_000)
  })

  it('agrees with the ROI engine’s CAGR helper', () => {
    const result = calculateCagrDetails({ beginValue: 4_000, endValue: 9_000, periodYears: 6 })
    expect(result.cagr).toBe(calculateCagr(4_000, 9_000, 6))
  })

  it('supports fractional years and ends the path exactly on the ending value', () => {
    const result = calculateCagrDetails({ beginValue: 10_000, endValue: 15_000, periodYears: 2.5 })
    // 1.5^(1/2.5) − 1 = 0.17609…
    expect(result.cagr).toBe(17.61)
    expect(result.path.map((p) => p.year)).toEqual([0, 1, 2, 2.5])
    expect(result.path[3].value).toBe(15_000)
  })

  it('reports a negative CAGR on a loss and −100% on a total loss', () => {
    const loss = calculateCagrDetails({ beginValue: 10_000, endValue: 8_000, periodYears: 3 })
    expect(loss.cagr).toBeLessThan(0)
    expect(loss.isGain).toBe(false)
    expect(loss.absoluteGain).toBe(-2_000)

    const wipeout = calculateCagrDetails({ beginValue: 10_000, endValue: 0, periodYears: 3 })
    expect(wipeout.isValid).toBe(true)
    expect(wipeout.cagr).toBe(-100)
  })

  it('is invalid for a non-positive beginning value, a negative ending value, or zero years', () => {
    expect(calculateCagrDetails({ beginValue: 0, endValue: 5_000, periodYears: 5 }).isValid).toBe(false)
    expect(calculateCagrDetails({ beginValue: -1_000, endValue: 5_000, periodYears: 5 }).isValid).toBe(false)
    expect(calculateCagrDetails({ beginValue: 1_000, endValue: -5, periodYears: 5 }).isValid).toBe(false)
    expect(calculateCagrDetails({ beginValue: 1_000, endValue: 2_000, periodYears: 0 }).isValid).toBe(false)
  })

  it('never produces NaN from garbage input', () => {
    const result = calculateCagrDetails({
      beginValue: Number.NaN,
      endValue: Number.POSITIVE_INFINITY,
      periodYears: Number.NaN,
    })
    expect(result.isValid).toBe(false)
    expect(Number.isFinite(result.cagr)).toBe(true)
  })
})
