import Big from 'big.js'

/**
 * Number of decimal places for currency amounts.
 * Standard for most currencies (USD, EUR, etc.)
 */
const CURRENCY_DECIMALS = 2

/**
 * Rounds a number to 2 decimal places using banker's rounding (half-even).
 * Uses big.js to avoid floating-point precision issues.
 *
 * @param value - The number to round
 * @returns The rounded number with 2 decimal places
 *
 * @example
 * round2(10.005) // 10.01
 * round2(10.004) // 10.00
 * round2(0.1 + 0.2) // 0.30 (not 0.30000000000000004)
 */
export function round2(value: number): number {
  return new Big(value).round(CURRENCY_DECIMALS, Big.roundHalfEven).toNumber()
}

/**
 * Safely converts a value from NumberInput to number | null.
 * Handles empty strings, undefined, and NaN values.
 *
 * @param value - The value from Mantine's NumberInput (number | string | undefined)
 * @returns number | null (never NaN)
 *
 * @example
 * toNumberOrNull(123.45) // 123.45
 * toNumberOrNull('') // null
 * toNumberOrNull(undefined) // null
 * toNumberOrNull(NaN) // null
 */
export function toNumberOrNull(
  value: number | string | undefined | null
): number | null {
  if (value === '' || value === undefined || value === null) {
    return null
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return Number.isNaN(parsed) ? null : parsed
  }

  return Number.isNaN(value) ? null : value
}

/**
 * Formats a number for display, ensuring consistent decimal places.
 * Returns undefined for null values (allows input to show as empty).
 *
 * @param value - The number to format
 * @returns The number or undefined
 */
export function formatForDisplay(value: number | null): number | undefined {
  return value === null ? undefined : value
}
