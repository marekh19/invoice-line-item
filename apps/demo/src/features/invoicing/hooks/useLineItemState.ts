import { useState } from 'react'
import type { LineItemValue } from '@/features/invoicing/types'
import { computeGross, computeNet } from '@/features/invoicing/utils/vat'
import { toNumberOrNull } from '@/features/invoicing/utils/money'

type UseLineItemStateOptions = {
  /** The controlled value from parent - source of truth */
  value: LineItemValue
  /** Callback when values change (on commit events: blur, rate change) */
  onChange?: (value: LineItemValue) => void
}

type UseLineItemStateReturn = {
  /** Current net value (editing value or prop value) */
  net: number | null
  /** Current gross value (editing value or prop value) */
  gross: number | null
  /** Current VAT rate (always from props) */
  vatRate: number
  /** Whether user has made any changes (for validation purposes) */
  hasUserInteracted: boolean
  /** Handler for net input changes (updates local editing state) */
  handleNetChange: (value: number | string) => void
  /** Handler for gross input changes (updates local editing state) */
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
 * ## Controlled Component Pattern
 *
 * This hook implements a controlled component pattern where:
 * - The `value` prop is the source of truth (owned by parent)
 * - Local state only tracks in-progress editing (what user is typing)
 * - On commit (blur, VAT change), `onChange` is called with new values
 * - Parent updates its state, new props flow back down
 *
 * ## Key behaviors:
 *
 * 1. **Source of truth**: Props are always the source of truth.
 *    Local editing state is only used while user is actively typing.
 *
 * 2. **Net wins for VAT changes**: When VAT rate changes, gross is recalculated from net.
 *
 * 3. **Dirty tracking**: Only recalculates on blur if the field was actually modified.
 *
 * 4. **Prop sync**: When `value` prop changes externally (e.g., server refetch),
 *    internal editing state is cleared and validation state is reset.
 *
 * 5. **Precise math**: Uses big.js internally for accurate decimal calculations.
 *
 * @see /docs/04-reasoning.md for detailed explanation of the recalculation strategy
 */
export const useLineItemState = ({
  value,
  onChange,
}: UseLineItemStateOptions): UseLineItemStateReturn => {
  // Track the previous value to detect external prop changes
  // This pattern is recommended by React docs for syncing state with props
  // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevValue, setPrevValue] = useState(value)

  // Editing state: tracks what user is typing before commit (blur)
  // Only one field can be edited at a time
  const [editingField, setEditingField] = useState<'net' | 'gross' | null>(null)
  const [editingValue, setEditingValue] = useState<number | null>(null)

  // Track if user has interacted (for validation - only validate initial data)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  // Detect external prop changes (e.g., server refetch) and reset state
  // If value changed and it's different from what we last tracked, it's external
  if (
    value.net !== prevValue.net ||
    value.gross !== prevValue.gross ||
    value.vatRate !== prevValue.vatRate
  ) {
    setPrevValue(value)
    setHasUserInteracted(false)
    setEditingField(null)
    setEditingValue(null)
  }

  // Display values: use editing value while editing, otherwise prop value
  const net = editingField === 'net' ? editingValue : value.net
  const gross = editingField === 'gross' ? editingValue : value.gross
  const vatRate = value.vatRate // Always from props

  /**
   * Commits a new value by updating prevValue and calling onChange.
   * Updating prevValue prevents the external change detection from triggering.
   */
  const commit = (newValue: LineItemValue) => {
    setPrevValue(newValue)
    setEditingField(null)
    setEditingValue(null)
    onChange?.(newValue)
  }

  const handleNetChange = (val: number | string) => {
    setEditingField('net')
    setEditingValue(toNumberOrNull(val))
    setHasUserInteracted(true)
  }

  const handleGrossChange = (val: number | string) => {
    setEditingField('gross')
    setEditingValue(toNumberOrNull(val))
    setHasUserInteracted(true)
  }

  const handleNetBlur = () => {
    // Only recalculate if net was being edited
    if (editingField !== 'net') return

    const amounts = computeAmounts('net', editingValue, value.vatRate)
    commit({ ...amounts, vatRate: value.vatRate })
  }

  const handleGrossBlur = () => {
    // Only recalculate if gross was being edited
    if (editingField !== 'gross') return

    const amounts = computeAmounts('gross', editingValue, value.vatRate)
    commit({ ...amounts, vatRate: value.vatRate })
  }

  /**
   * Handles VAT rate change.
   * Uses the currently displayed net value (editing or prop) to calculate new gross.
   */
  const handleVatRateChange = (newRate: number) => {
    setHasUserInteracted(true)

    // Use currently displayed net value for calculation
    const currentNet = editingField === 'net' ? editingValue : value.net
    const newGross = currentNet !== null ? computeGross(currentNet, newRate) : value.gross

    commit({ net: currentNet, gross: newGross, vatRate: newRate })
  }

  /**
   * Fixes inconsistent data by recalculating gross from net.
   * Use when initial data from server has mismatched net/gross values.
   */
  const fixGross = () => {
    if (value.net === null) return

    const correctedGross = computeGross(value.net, value.vatRate)
    setHasUserInteracted(true)
    commit({ net: value.net, gross: correctedGross, vatRate: value.vatRate })
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
