import { MAX_PERIODS, money, rate, round2 } from './guards'

export interface CreditCardInput {
  balance: number
  /** Purchase APR, e.g. 24.99. */
  annualRate: number
  /**
   * How the monthly payment is decided. `fixed` pays a set amount; `minimum`
   * models the lender's formula, which shrinks as the balance falls.
   */
  paymentMode: 'fixed' | 'minimum'
  /** Used when `paymentMode` is `fixed`. */
  fixedPayment?: number
  /** Minimum as a percentage of balance, typically 1–3. */
  minimumPercent?: number
  /** Floor on the minimum payment, typically 25–35. */
  minimumFloor?: number
  /** Optional monthly spending added to the balance. */
  monthlyPurchases?: number
}

export interface CreditCardMonth {
  month: number
  payment: number
  interest: number
  principal: number
  balance: number
}

export interface CreditCardResult {
  /** False when the payment never clears the balance within 50 years. */
  payoffPossible: boolean
  monthsToPayoff: number
  totalInterest: number
  totalPaid: number
  /** First month's payment — the figure the user recognises from a statement. */
  firstPayment: number
  /** Interest as a multiple of the original balance. */
  interestToBalanceRatio: number
  schedule: CreditCardMonth[]

  /**
   * What paying the lender's minimum would cost, for comparison. Populated only
   * when the user chose a fixed payment, so the page can quantify the difference.
   */
  minimumComparison: {
    monthsToPayoff: number
    totalInterest: number
    payoffPossible: boolean
  } | null

  isValid: boolean
}

const DEFAULT_MINIMUM_PERCENT = 2
const DEFAULT_MINIMUM_FLOOR = 25

/**
 * Simulates paying down a revolving credit-card balance.
 *
 * A card is not an instalment loan, and the difference is the whole point of this
 * calculator. Because the lender's minimum payment is a percentage of the
 * *current* balance, it falls as the balance falls, so an ever-smaller share goes
 * to principal. That is the minimum-payment trap, and only a month-by-month
 * simulation shows it — a closed-form annuity assumes a fixed payment and would
 * understate the term by years.
 */
function simulate(
  input: CreditCardInput,
  forceMinimumMode: boolean
): {
  months: number
  totalInterest: number
  totalPaid: number
  firstPayment: number
  schedule: CreditCardMonth[]
  cleared: boolean
} {
  const startingBalance = money(input.balance)
  const monthlyRate = rate(input.annualRate) / 100 / 12
  const minimumPercent = Math.min(
    Math.max(money(input.minimumPercent) || DEFAULT_MINIMUM_PERCENT, 0.1),
    100
  )
  const minimumFloor = money(input.minimumFloor) || DEFAULT_MINIMUM_FLOOR
  const monthlyPurchases = money(input.monthlyPurchases)
  const useMinimum = forceMinimumMode || input.paymentMode === 'minimum'
  const fixedPayment = money(input.fixedPayment)

  const schedule: CreditCardMonth[] = []
  let balance = startingBalance
  let totalInterest = 0
  let totalPaid = 0
  let firstPayment = 0
  let month = 0

  while (balance > 0 && month < MAX_PERIODS) {
    month++

    // New purchases post before interest is assessed on the statement balance.
    balance += monthlyPurchases

    const interest = balance * monthlyRate
    balance += interest
    totalInterest += interest

    const requiredMinimum = Math.max(Math.min(balance, minimumFloor), balance * (minimumPercent / 100))
    const payment = useMinimum ? Math.min(requiredMinimum, balance) : Math.min(fixedPayment, balance)

    if (month === 1) firstPayment = payment

    // A payment that cannot cover the interest means the balance grows without
    // bound. Stop and report it rather than iterating to the cap.
    if (payment <= interest && balance > 0) {
      schedule.push({
        month,
        payment: round2(payment),
        interest: round2(interest),
        principal: round2(payment - interest),
        balance: round2(balance - payment),
      })
      balance -= payment
      totalPaid += payment
      return {
        months: month,
        totalInterest: round2(totalInterest),
        totalPaid: round2(totalPaid),
        firstPayment: round2(firstPayment),
        schedule,
        cleared: false,
      }
    }

    balance -= payment
    totalPaid += payment
    if (balance < 0.005) balance = 0

    schedule.push({
      month,
      payment: round2(payment),
      interest: round2(interest),
      principal: round2(payment - interest),
      balance: round2(balance),
    })
  }

  return {
    months: month,
    totalInterest: round2(totalInterest),
    totalPaid: round2(totalPaid),
    firstPayment: round2(firstPayment),
    schedule,
    cleared: balance === 0,
  }
}

export function calculateCreditCardPayoff(input: CreditCardInput): CreditCardResult {
  const startingBalance = money(input.balance)

  if (startingBalance <= 0) {
    return {
      payoffPossible: false,
      monthsToPayoff: 0,
      totalInterest: 0,
      totalPaid: 0,
      firstPayment: 0,
      interestToBalanceRatio: 0,
      schedule: [],
      minimumComparison: null,
      isValid: false,
    }
  }

  const main = simulate(input, false)

  // When the user set their own payment, also model the lender's minimum so the
  // page can show what the difference is worth.
  const minimumComparison =
    input.paymentMode === 'fixed'
      ? (() => {
          const min = simulate(input, true)
          return {
            monthsToPayoff: min.cleared ? min.months : 0,
            totalInterest: min.totalInterest,
            payoffPossible: min.cleared,
          }
        })()
      : null

  return {
    payoffPossible: main.cleared,
    monthsToPayoff: main.cleared ? main.months : 0,
    totalInterest: main.totalInterest,
    totalPaid: main.totalPaid,
    firstPayment: main.firstPayment,
    interestToBalanceRatio:
      startingBalance > 0 ? round2((main.totalInterest / startingBalance) * 100) : 0,
    schedule: main.schedule,
    minimumComparison,
    isValid: true,
  }
}
