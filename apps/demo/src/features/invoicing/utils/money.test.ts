import { describe, expect, it } from 'vitest'

import { round2, toNumberOrNull } from './money'

describe('round2', () => {
  it('rounds to 2 decimal places', () => {
    expect(round2(10.005)).toBe(10.0)
    expect(round2(10.004)).toBe(10.0)
  })

  it('handles floating point precision issues', () => {
    // Classic JS floating point problem: 0.1 + 0.2 = 0.30000000000000004
    expect(round2(0.1 + 0.2)).toBe(0.3)
  })

  it('uses banker rounding (half-even)', () => {
    // When exactly at .5, round to nearest even number
    expect(round2(2.225)).toBe(2.22) // rounds down to even
    expect(round2(2.235)).toBe(2.24) // rounds up to even
    expect(round2(2.245)).toBe(2.24) // rounds down to even
    expect(round2(2.255)).toBe(2.26) // rounds up to even
  })

  it('handles whole numbers', () => {
    expect(round2(100)).toBe(100)
  })
})

describe('toNumberOrNull', () => {
  it('returns number for valid number input', () => {
    expect(toNumberOrNull(123.45)).toBe(123.45)
    expect(toNumberOrNull(0)).toBe(0)
  })

  it('returns null for empty string', () => {
    expect(toNumberOrNull('')).toBeNull()
  })

  it('returns null for undefined', () => {
    expect(toNumberOrNull(undefined)).toBeNull()
  })

  it('returns null for null', () => {
    expect(toNumberOrNull(null)).toBeNull()
  })

  it('returns null for NaN', () => {
    expect(toNumberOrNull(NaN)).toBeNull()
  })

  it('parses numeric strings', () => {
    expect(toNumberOrNull('123.45')).toBe(123.45)
    expect(toNumberOrNull('0')).toBe(0)
  })

  it('returns null for non-numeric strings', () => {
    expect(toNumberOrNull('abc')).toBeNull()
  })
})
