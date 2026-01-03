import Big from 'big.js'
import { round2 } from './money'

/**
 * Computes the gross amount from net amount and VAT rate.
 *
 * Formula: gross = net * (1 + vatRate / 100)
 *
 * @param net - The net amount (without VAT)
 * @param vatRate - The VAT rate as a percentage (e.g., 21 for 21%)
 * @returns The gross amount, rounded to 2 decimal places
 *
 * @example
 * computeGross(100, 21) // 121.00
 * computeGross(100, 0)  // 100.00
 */
export const computeGross = (net: number, vatRate: number): number => {
  const multiplier = new Big(1).plus(new Big(vatRate).div(100))
  const gross = new Big(net).times(multiplier)
  return round2(gross.toNumber())
}

/**
 * Computes the net amount from gross amount and VAT rate.
 *
 * Formula: net = gross / (1 + vatRate / 100)
 *
 * @param gross - The gross amount (with VAT)
 * @param vatRate - The VAT rate as a percentage (e.g., 21 for 21%)
 * @returns The net amount, rounded to 2 decimal places
 *
 * @example
 * computeNet(121, 21) // 100.00
 * computeNet(100, 0)  // 100.00
 */
export const computeNet = (gross: number, vatRate: number): number => {
  const divisor = new Big(1).plus(new Big(vatRate).div(100))
  const net = new Big(gross).div(divisor)
  return round2(net.toNumber())
}
