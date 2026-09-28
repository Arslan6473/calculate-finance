import { describe, expect, it } from 'vitest'
import {
  MAX_MONEY,
  MAX_PERIODS,
  annuityPayment,
  futureValue,
  money,
  num,
  periodicRate,
  periods,
  rate,
  round2,
  signedMoney,
  signedRate,
} from '@/lib/calculators/guards'

describe('num', () => {
  it('passes finite numbers through', () => {
    expect(num(42)).toBe(42)
    expect(num(-3.5)).toBe(-3.5)
    expect(num(0)).toBe(0)
  })

  it('maps every flavour of empty or invalid input to zero', () => {
    expect(num('')).toBe(0)
    expect(num('   ')).toBe(0)
    expect(num(null)).toBe(0)
    expect(num(undefined)).toBe(0)
    expect(num(NaN)).toBe(0)
    expect(num(Infinity)).toBe(0)
    expect(num(-Infinity)).toBe(0)
    expect(num('abc')).toBe(0)
    expect(num({})).toBe(0)
  })

  it('parses numeric strings, tolerating separators and currency symbols', () => {
    expect(num('1234')).toBe(1234)
    expect(num('1,234')).toBe(1234)
    expect(num('$1,234.56')).toBe(1234.56)
    expect(num('£400,000')).toBe(400000)
    expect(num(' 6.5 ')).toBe(6.5)
  })
})

describe('money', () => {
  it('clamps negatives to zero', () => {
    expect(money(-500)).toBe(0)
  })

  it('caps at the documented ceiling so schedules cannot blow up', () => {
    expect(money(1e15)).toBe(MAX_MONEY)
  })

  it('preserves ordinary amounts', () => {
    expect(money(400_000)).toBe(400_000)
  })
})

describe('signedMoney', () => {
  it('keeps negatives, which are meaningful for losses', () => {
    expect(signedMoney(-500)).toBe(-500)
  })

  it('caps in both directions', () => {
    expect(signedMoney(-1e15)).toBe(-MAX_MONEY)
    expect(signedMoney(1e15)).toBe(MAX_MONEY)
  })
})

describe('rate', () => {
  it('clamps negative rates to zero', () => {
    expect(rate(-5)).toBe(0)
  })

  it('allows negative rates via signedRate, for inflation and losses', () => {
    expect(signedRate(-2.5)).toBe(-2.5)
  })
})

describe('periods', () => {
  it('floors fractional periods', () => {
    expect(periods(360.7)).toBe(360)
  })

  it('caps at 600 months', () => {
    expect(periods(100_000)).toBe(MAX_PERIODS)
  })

  it('clamps negatives to zero', () => {
    expect(periods(-12)).toBe(0)
  })
})

describe('round2', () => {
  it('rounds to cents', () => {
    expect(round2(1.005)).toBe(1.01)
    expect(round2(2.344)).toBe(2.34)
    expect(round2(2.345)).toBe(2.35)
  })

  it('maps non-finite values to zero rather than propagating them', () => {
    expect(round2(NaN)).toBe(0)
    expect(round2(Infinity)).toBe(0)
  })
})

describe('periodicRate', () => {
  it('converts an annual percentage to a monthly decimal', () => {
    expect(periodicRate(6, 12)).toBeCloseTo(0.005, 10)
  })

  it('returns zero rather than dividing by zero', () => {
    expect(periodicRate(6, 0)).toBe(0)
  })
})

describe('annuityPayment', () => {
  /*
    Reference case: $200,000 at 6% over 30 years (360 payments).
    P = 200000 × 0.005 / (1 − 1.005^−360) = $1,199.10
  */
  it('matches the standard annuity formula', () => {
    expect(annuityPayment(200_000, 0.005, 360)).toBeCloseTo(1199.1, 1)
  })

  it('divides principal evenly at a zero rate instead of dividing by zero', () => {
    expect(annuityPayment(12_000, 0, 12)).toBe(1000)
  })

  it('returns zero for a zero principal or zero term', () => {
    expect(annuityPayment(0, 0.005, 360)).toBe(0)
    expect(annuityPayment(200_000, 0.005, 0)).toBe(0)
  })

  it('degrades to interest-only rather than overflowing on absurd inputs', () => {
    const payment = annuityPayment(100_000, 50, 600)
    expect(Number.isFinite(payment)).toBe(true)
    expect(payment).toBeGreaterThan(0)
  })
})

describe('futureValue', () => {
  it('compounds a present sum', () => {
    // 1000 × 1.05^10 = 1628.89
    expect(futureValue(1000, 0, 0.05, 10)).toBeCloseTo(1628.89, 2)
  })

  it('adds an annuity of contributions', () => {
    // 100 × ((1.05^10 − 1)/0.05) = 1257.79
    expect(futureValue(0, 100, 0.05, 10)).toBeCloseTo(1257.79, 2)
  })

  it('sums linearly at a zero rate', () => {
    expect(futureValue(1000, 100, 0, 10)).toBe(2000)
  })

  it('returns the present value when there are no periods', () => {
    expect(futureValue(1000, 100, 0.05, 0)).toBe(1000)
  })
})
