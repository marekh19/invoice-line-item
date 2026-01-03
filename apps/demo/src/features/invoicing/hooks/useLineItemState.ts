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
  /** Whether user has made any changes (for validation purposes) */
  hasUserInteracted: boolean
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
  /** Recalculates gross from net to fix inconsistent data */
  fixGross: () => void
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
 *    - Blur of net/gross input (only if value was changed)
 *    - VAT rate change (recalculates gross from net)
 *
 * 3. **Dirty tracking**: Only recalculates on blur if the field was actually
 *    modified. This prevents rounding drift when just clicking between fields.
 *
 * 4. **Empty handling**: When a field is cleared and blurred,
 *    the other field is also cleared for consistency.
 *
 * 5. **Precise math**: Uses big.js internally for accurate decimal calculations.
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
  const [, setLastEdited] = useState<LastEdited>(null)

  // Track which field is dirty (modified since last commit)
  const [dirtyField, setDirtyField] = useState<'net' | 'gross' | null>(null)

  // Track if user has made any changes (for validation - only validate initial data)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  const handleNetChange = (value: number | string) => {
    setNet(toNumberOrNull(value))
    setLastEdited('net')
    setDirtyField('net')
    setHasUserInteracted(true)
  }

  const handleGrossChange = (value: number | string) => {
    setGross(toNumberOrNull(value))
    setLastEdited('gross')
    setDirtyField('gross')
    setHasUserInteracted(true)
  }

  const handleNetBlur = () => {
    // Only recalculate if net was actually changed
    if (dirtyField !== 'net') return

    const amounts = computeAmounts('net', net, vatRate)
    setGross(amounts.gross)
    setDirtyField(null)
    onChange?.({ ...amounts, vatRate })
  }

  const handleGrossBlur = () => {
    // Only recalculate if gross was actually changed
    if (dirtyField !== 'gross') return

    const amounts = computeAmounts('gross', gross, vatRate)
    setNet(amounts.net)
    setDirtyField(null)
    onChange?.({ ...amounts, vatRate })
  }

  /**
   * Handles VAT rate change.
   * Always recalculates gross from net (net is the source of truth).
   * If net is null, only the rate changes without recalculation.
   */
  const handleVatRateChange = (newRate: number) => {
    setVatRate(newRate)
    setHasUserInteracted(true)
    setDirtyField(null) // VAT change commits any pending changes

    // Net is always the source of truth for VAT changes
    const newGross = net !== null ? computeGross(net, newRate) : gross
    setGross(newGross)
    onChange?.({ net, gross: newGross, vatRate: newRate })
  }

  /**
   * Fixes inconsistent data by recalculating gross from net.
   * Use when initial data from server has mismatched net/gross values.
   */
  const fixGross = () => {
    if (net === null) return

    const correctedGross = computeGross(net, vatRate)
    setGross(correctedGross)
    setHasUserInteracted(true)
    onChange?.({ net, gross: correctedGross, vatRate })
  }

  return {
    net,
    gross,
    vatRate,
    hasUserInteracted,
    handleNetChange,
    handleGrossChange,
    handleNetBlur,
    handleGrossBlur,
    handleVatRateChange,
    fixGross,
  }
}
