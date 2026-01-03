import { useCallback, useState } from 'react'
import { toNumberOrNull } from '../utils/money'
import { computeGross, computeNet } from '../utils/vat'
import type { LastEdited, LineItemValue } from '../types'

interface UseLineItemStateOptions {
  /** Initial value for the line item */
  initialValue: LineItemValue
  /** Callback when values change (on commit events: blur, rate change) */
  onChange?: (value: LineItemValue) => void
}

interface UseLineItemStateReturn {
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
 * Hook for managing line item state with VAT calculations.
 *
 * ## Key behaviors:
 *
 * 1. **Source of truth**: The last edited field determines which value
 *    is preserved during recalculations. Default is 'net' for pristine state.
 *
 * 2. **Commit-based recalculation**: Recalculations happen on:
 *    - Blur of net/gross input
 *    - VAT rate change
 *
 * 3. **Empty handling**: When a field is cleared and blurred,
 *    the other field is also cleared for consistency.
 *
 * 4. **Precise math**: Uses big.js internally for accurate decimal calculations.
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
export function useLineItemState({
  initialValue,
  onChange,
}: UseLineItemStateOptions): UseLineItemStateReturn {
  const [net, setNet] = useState<number | null>(initialValue.net)
  const [gross, setGross] = useState<number | null>(initialValue.gross)
  const [vatRate, setVatRate] = useState<number>(initialValue.vatRate)
  const [lastEdited, setLastEdited] = useState<LastEdited>(null)

  /**
   * Emits the current value to the parent component.
   */
  const emitChange = useCallback(
    (newNet: number | null, newGross: number | null, newVatRate: number) => {
      onChange?.({ net: newNet, gross: newGross, vatRate: newVatRate })
    },
    [onChange]
  )

  /**
   * Handles changes to the net input (during typing).
   * Only updates local state and marks net as last edited.
   */
  const handleNetChange = useCallback((value: number | string) => {
    const numValue = toNumberOrNull(value)
    setNet(numValue)
    setLastEdited('net')
  }, [])

  /**
   * Handles changes to the gross input (during typing).
   * Only updates local state and marks gross as last edited.
   */
  const handleGrossChange = useCallback((value: number | string) => {
    const numValue = toNumberOrNull(value)
    setGross(numValue)
    setLastEdited('gross')
  }, [])

  /**
   * Handles blur of the net input.
   * Commits the value and recalculates gross.
   */
  const handleNetBlur = useCallback(() => {
    if (net === null) {
      // Clear both fields when net is cleared
      setGross(null)
      emitChange(null, null, vatRate)
    } else {
      // Compute gross from net
      const newGross = computeGross(net, vatRate)
      setGross(newGross)
      emitChange(net, newGross, vatRate)
    }
  }, [net, vatRate, emitChange])

  /**
   * Handles blur of the gross input.
   * Commits the value and recalculates net.
   */
  const handleGrossBlur = useCallback(() => {
    if (gross === null) {
      // Clear both fields when gross is cleared
      setNet(null)
      emitChange(null, null, vatRate)
    } else {
      // Compute net from gross
      const newNet = computeNet(gross, vatRate)
      setNet(newNet)
      emitChange(newNet, gross, vatRate)
    }
  }, [gross, vatRate, emitChange])

  /**
   * Handles VAT rate change.
   * Recalculates based on the last edited field (or net if pristine).
   */
  const handleVatRateChange = useCallback(
    (newRate: number) => {
      setVatRate(newRate)

      // Determine source of truth: last edited field, or net as default
      const source = lastEdited ?? 'net'

      if (source === 'net') {
        if (net !== null) {
          // Recompute gross from net
          const newGross = computeGross(net, newRate)
          setGross(newGross)
          emitChange(net, newGross, newRate)
        } else {
          // No net value, just emit rate change
          emitChange(net, gross, newRate)
        }
      } else {
        if (gross !== null) {
          // Recompute net from gross
          const newNet = computeNet(gross, newRate)
          setNet(newNet)
          emitChange(newNet, gross, newRate)
        } else {
          // No gross value, just emit rate change
          emitChange(net, gross, newRate)
        }
      }
    },
    [net, gross, lastEdited, emitChange]
  )

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
