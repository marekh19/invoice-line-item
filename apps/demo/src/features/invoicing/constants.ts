import type { FieldLabels, VatRateOption } from './types'

/**
 * Number of decimal places for currency amounts.
 * Standard for most currencies (USD, EUR, etc.)
 */
export const CURRENCY_DECIMALS = 2

/**
 * Default VAT rate options available in the dropdown.
 */
export const DEFAULT_VAT_RATES = [
  { value: 0, label: '0%' },
  { value: 5, label: '5%' },
  { value: 10, label: '10%' },
  { value: 15, label: '15%' },
  { value: 21, label: '21%' },
  { value: 25, label: '25%' },
] as const satisfies ReadonlyArray<VatRateOption>

/*
 * Default field labels for the input/select elements
 */
export const DEFAULT_LABELS = {
  net: 'Net amount',
  gross: 'Gross amount',
  vatRate: 'VAT rate',
} as const satisfies FieldLabels
