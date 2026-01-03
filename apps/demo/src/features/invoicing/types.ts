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
 * Tracks which field was last edited by the user.
 * Used to determine the source of truth for recalculations.
 *
 * - null = pristine state, treat as 'net'
 * - 'net' = net was last edited, gross should be computed from net
 * - 'gross' = gross was last edited, net should be computed from gross
 */
export type LastEdited = 'net' | 'gross' | null

/**
 * Internal state used by the useLineItemState hook.
 */
export type LineItemState = {
  net: number | null
  gross: number | null
  vatRate: number
  lastEdited: LastEdited
}

/**
 * Prefix / suffix unit used next to the value in net and gross inputs in LineItem component
 */
export type UnitDisplay = {
  prefix?: string
  suffix?: string
}

/**
 * Custom labels for net, gross and VAT select fields in LineItem component
 */
export type FieldLabels = {
  net: string
  gross: string
  vatRate: string
}
