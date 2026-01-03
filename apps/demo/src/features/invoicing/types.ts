/**
 * Represents the value of a line item with net, gross amounts and VAT rate.
 *
 * Net and gross are in major currency units (e.g., 123.45 for $123.45).
 * Use `null` to represent an empty/cleared field.
 */
export type LineItemValue = {
  net: number | null
  gross: number | null
  vatRate: number
}

/**
 * VAT rate option for the dropdown.
 * Value is the percentage (e.g., 21 for 21%).
 */
export type VatRateOption = {
  value: number
  label: string
}

/**
 * Internal state used by the useLineItemState hook.
 */
export type LineItemState = {
  net: number | null
  gross: number | null
  vatRate: number
  /** Whether the field has been modified since last commit */
  dirtyField: 'net' | 'gross' | null
  /** Whether user has interacted with the component */
  hasUserInteracted: boolean
}

/**
 * Prefix / suffix unit used next to the value in net and gross inputs in LineItem component
 */
export type UnitDisplay = {
  prefix?: string
  suffix?: string
}

/**
 * Custom labels for LineItem component fields and validation messages
 */
export type FieldLabels = {
  /** Label for net amount input */
  net: string
  /** Label for gross amount input */
  gross: string
  /** Label for VAT rate select */
  vatRate: string
  /** Error message shown when gross doesn't match calculated value */
  grossError: string
  /** Tooltip and aria-label for the fix button */
  fixButton: string
}
