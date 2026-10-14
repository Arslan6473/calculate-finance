import type { CategorySlug } from '../categories'

/**
 * The declarative half of the calculator contract (design spec §3.2). Every
 * field here drives the auto-generated `CalculatorForm` — numeric keyboard,
 * label wiring, help text, range clamping and error messages are implemented
 * once against this shape and are correct for every calculator by construction.
 */
export type InputFieldType = 'currency' | 'percent' | 'number' | 'years' | 'select' | 'toggle'

interface BaseField {
  /** Key in the calculator's input object and the form's field name. */
  name: string
  label: string
  help?: string
  /** Groups related fields under a subheading, e.g. "Escrow costs". */
  group?: string
}

export interface NumericField extends BaseField {
  type: 'currency' | 'percent' | 'number' | 'years'
  defaultValue: number
  min?: number
  max?: number
  step?: number
  /** Short unit label shown beside the field, e.g. "years", "%". Currency uses the active currency symbol instead. */
  unit?: string
}

export interface SelectField extends BaseField {
  type: 'select'
  defaultValue: string | number
  options: Array<{ label: string; value: string | number }>
}

export interface ToggleField extends BaseField {
  type: 'toggle'
  defaultValue: boolean
}

export type InputField = NumericField | SelectField | ToggleField

export interface CalculatorFaq {
  question: string
  answer: string
}

export interface CalculatorSeo {
  title: string
  description: string
  keywords: string[]
}

export interface CalculatorConfig {
  slug: string
  name: string
  /** Short label for nav/breadcrumb chips where the full name is too long. */
  shortName: string
  category: CategorySlug
  /** ISO date (YYYY-MM-DD) the calculator or its explanation was last meaningfully revised. */
  updated: string
  /** One sentence for search results and category cards. */
  summary: string
  inputs: InputField[]
  faqs: CalculatorFaq[]
  /** Slugs of other calculators in the registry. Validated at build time. */
  related: string[]
  seo: CalculatorSeo
}
