import { describe, expect, it } from 'vitest'
import { computeGross, computeNet } from './vat'

describe('computeGross', () => {
  it('computes gross from net with 21% VAT', () => {
    expect(computeGross(100, 21)).toBe(121)
  })

  it('returns net when VAT is 0%', () => {
    expect(computeGross(100, 0)).toBe(100)
  })

  it('rounds to 2 decimal places', () => {
    expect(computeGross(99.99, 21)).toBe(120.99)
  })
})

describe('computeNet', () => {
  it('computes net from gross with 21% VAT', () => {
    expect(computeNet(121, 21)).toBe(100)
  })

  it('returns gross when VAT is 0%', () => {
    expect(computeNet(100, 0)).toBe(100)
  })

  it('rounds to 2 decimal places', () => {
    expect(computeNet(100, 21)).toBe(82.64)
  })
})
