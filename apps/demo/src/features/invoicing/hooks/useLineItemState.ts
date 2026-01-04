import { useState } from 'react'

import type { LineItemValue } from '@/features/invoicing/types'
import { toNumberOrNull } from '@/features/invoicing/utils/money'
import { computeGross, computeNet } from '@/features/invoicing/utils/vat'

type UseLineItemStateOptions = {
  /** The value from parent - source of truth for confirmed state */
  value: LineItemValue
  /** Callback when values change (on commit events: blur, rate change) */
  onChange?: (value: LineItemValue) => void
}

type UseLineItemStateReturn = {
  /** Current net value to display */
  net: number | null
  /** Current gross value to display */
  gross: number | null
  /** Current VAT rate to display */
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
 * Checks if two LineItemValue objects have different values.
 */
const valuesDiffer = (a: LineItemValue, b: LineItemValue): boolean =>
  a.net !== b.net || a.gross !== b.gross || a.vatRate !== b.vatRate

/**
 * Hook for managing line item state with VAT calculations.
 *
 * Implements controlled component with optimistic state pattern.
 *
 * @see ./useLineItemState.md for detailed documentation
 */
export const useLineItemState = ({
  value,
  onChange,
}: UseLineItemStateOptions): UseLineItemStateReturn => {
  // Track the previous prop value to detect external changes
  const [prevPropValue, setPrevPropValue] = useState(value)

  // Pending value: committed changes waiting for parent confirmation
  // This allows the component to show edited values even if parent
  // doesn't immediately update the value prop
  const [pendingValue, setPendingValue] = useState<LineItemValue | null>(null)

  // Editing state: what user is currently typing (before blur/commit)
  const [editingField, setEditingField] = useState<'net' | 'gross' | null>(null)
  const [editingValue, setEditingValue] = useState<number | null>(null)

  // Track if user has interacted (for validation - only validate initial data)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  // Detect external prop changes (server refetch or parent state update)
  // Reset all internal state when props change from outside
  if (valuesDiffer(value, prevPropValue)) {
    setPrevPropValue(value)
    setPendingValue(null) // Parent confirmed (or sent new data), clear pending
    setEditingField(null)
    setEditingValue(null)
    setHasUserInteracted(false)
  }

  // Effective value: what we consider the "current" value
  // Priority: pending value (if set) > prop value
  const effectiveValue = pendingValue ?? value

  // Display values: editing value while typing, otherwise effective value
  const net = editingField === 'net' ? editingValue : effectiveValue.net
  const gross = editingField === 'gross' ? editingValue : effectiveValue.gross
  const vatRate = effectiveValue.vatRate

  /**
   * Commits a new value by setting it as pending and notifying parent.
   * The pending value will be displayed until parent updates props.
   */
  const commit = (newValue: LineItemValue) => {
    setPendingValue(newValue)
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

    const amounts = computeAmounts('net', editingValue, effectiveValue.vatRate)
    commit({ ...amounts, vatRate: effectiveValue.vatRate })
  }

  const handleGrossBlur = () => {
    // Only recalculate if gross was being edited
    if (editingField !== 'gross') return

    const amounts = computeAmounts(
      'gross',
      editingValue,
      effectiveValue.vatRate,
    )
    commit({ ...amounts, vatRate: effectiveValue.vatRate })
  }

  /**
   * Handles VAT rate change.
   * Uses the current effective net value to calculate new gross.
   */
  const handleVatRateChange = (newRate: number) => {
    setHasUserInteracted(true)

    // Use current effective net (could be from pending or editing state)
    const currentNet =
      editingField === 'net' ? editingValue : effectiveValue.net
    const newGross =
      currentNet !== null
        ? computeGross(currentNet, newRate)
        : effectiveValue.gross

    commit({ net: currentNet, gross: newGross, vatRate: newRate })
  }

  /**
   * Fixes inconsistent data by recalculating gross from net.
   * Use when initial data from server has mismatched net/gross values.
   */
  const fixGross = () => {
    const currentNet = effectiveValue.net
    if (currentNet === null) return

    const correctedGross = computeGross(currentNet, effectiveValue.vatRate)
    setHasUserInteracted(true)
    commit({
      net: currentNet,
      gross: correctedGross,
      vatRate: effectiveValue.vatRate,
    })
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
