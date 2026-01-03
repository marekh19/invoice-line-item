import { computeGross } from './vat'

/**
 * Checks if the gross amount matches the expected value based on net and VAT rate.
 * Used to detect inconsistent data that may have come from the server.
 *
 * @param net - The net amount
 * @param gross - The gross amount to validate
 * @param vatRate - The VAT rate as a percentage
 * @returns true if the gross matches the expected calculation, false otherwise
 *
 * @example
 * isGrossValid(100, 121, 21) // true
 * isGrossValid(100, 120, 21) // false - should be 121
 */
export const isGrossValid = (
  net: number | null,
  gross: number | null,
  vatRate: number,
): boolean => {
  // If either value is null, we can't validate (not an error state)
  if (net === null || gross === null) {
    return true
  }

  const expectedGross = computeGross(net, vatRate)
  return gross === expectedGross
}
