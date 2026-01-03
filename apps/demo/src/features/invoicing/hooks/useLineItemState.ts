import { useState } from 'react'
import type { LastEdited, LineItemValue } from '@/features/invoicing/types'
import { computeGross, computeNet } from '@/features/invoicing/utils/vat'
import { toNumberOrNull } from '@/features/invoicing/utils/money'

type UseLineItemStateOptions = {
  /** Initial value for the line item */
  initialValue: LineItemValue
  /** Callback when values change (on commit events: blur, rate change) */
  onChange?: (value: LineItemValue) => void
}

type UseLineItemStateReturn = {
  /** Current net value */
  net: number | null
  /** Current gross value */
  gross: number | null
  /** Current VAT rate */
  vatRate: number
  /** Handler for net input changes (updates local state) */
  handleNetChange: (value: number | string) => void
  /** Handler for gross input changes (updates local state) */
  handleGrossChange: (value: number | string) => void
  /** Handler for net input blur (commits and recalculates) */
  handleNetBlur: () => void
  /** Handler for gross input blur (commits and recalculates) */
  handleGrossBlur: () => void
  /** Handler for VAT rate change (commits and recalculates) */
  handleVatRateChange: (rate: number) => void
}

/**
 * Computes the complementary amount based on the source field.
 * If source value is null, both fields are cleared.
 */
const computeAmounts = (
  source: 'net' | 'gross',
  sourceValue: number | null,
  vatRate: number,
): { net: number | null; gross: number | null } =>
  sourceValue === null
    ? { net: null, gross: null }
    : {
        net: source === 'net' ? sourceValue : computeNet(sourceValue, vatRate),
        gross:
          source === 'gross' ? sourceValue : computeGross(sourceValue, vatRate),
      }

/**
 * Hook for managing line item state with VAT calculations.
 *
 * ## Key behaviors:
 *
 * 1. **Source of truth**: Net is always the source of truth for VAT rate changes.
 *    This provides predictable behavior aligned with standard B2B invoicing.
 *
 * 2. **Commit-based recalculation**: Recalculations happen on:
 *    - Blur of net/gross input (recalculates from the blurred field)
 *    - VAT rate change (recalculates gross from net)
 *
 * 3. **Empty handling**: When a field is cleared and blurred,
 *    the other field is also cleared for consistency.
 *
 * 4. **Precise math**: Uses big.js internally for accurate decimal calculations.
 *
 * @see /docs/04-reasoning.md for detailed explanation of the recalculation strategy
 *
 * @example
 * const {
 *   net, gross, vatRate,
 *   handleNetChange, handleGrossChange,
 *   handleNetBlur, handleGrossBlur,
 *   handleVatRateChange
 * } = useLineItemState({
 *   initialValue: { net: 100, gross: 121, vatRate: 21 },
 *   onChange: (value) => console.log('Value changed:', value)
 * })
 */
export const useLineItemState = ({
  initialValue,
  onChange,
}: UseLineItemStateOptions): UseLineItemStateReturn => {
  const [net, setNet] = useState<number | null>(initialValue.net)
  const [gross, setGross] = useState<number | null>(initialValue.gross)
  const [vatRate, setVatRate] = useState<number>(initialValue.vatRate)
  // Track last edited for potential future use, but VAT changes always use net
  const [, setLastEdited] = useState<LastEdited>(null)

  const handleNetChange = (value: number | string) => {
    setNet(toNumberOrNull(value))
    setLastEdited('net')
  }

  const handleGrossChange = (value: number | string) => {
    setGross(toNumberOrNull(value))
    setLastEdited('gross')
  }

  const handleNetBlur = () => {
    const amounts = computeAmounts('net', net, vatRate)
    setGross(amounts.gross)
    onChange?.({ ...amounts, vatRate })
  }

  const handleGrossBlur = () => {
    const amounts = computeAmounts('gross', gross, vatRate)
    setNet(amounts.net)
    onChange?.({ ...amounts, vatRate })
  }

  /**
   * Handles VAT rate change.
   * Always recalculates gross from net (net is the source of truth).
   * If net is null, only the rate changes without recalculation.
   */
  const handleVatRateChange = (newRate: number) => {
    setVatRate(newRate)

    // Net is always the source of truth for VAT changes
    const newGross = net !== null ? computeGross(net, newRate) : gross
    setGross(newGross)
    onChange?.({ net, gross: newGross, vatRate: newRate })
  }

  return {
    net,
    gross,
    vatRate,
    handleNetChange,
    handleGrossChange,
    handleNetBlur,
    handleGrossBlur,
    handleVatRateChange,
  }
}
