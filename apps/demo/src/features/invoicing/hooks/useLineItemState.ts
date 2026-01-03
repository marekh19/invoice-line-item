import { useState } from 'react'
import type { LastEdited, LineItemValue } from '@/features/invoicing/types'
import { computeGross, computeNet } from '@/features/invoicing/utils/vat'
import { toNumberOrNull } from '@/features/invoicing/utils/money'

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

  const commit = (amounts: { net: number | null; gross: number | null }, rate: number) => {
    setNet(amounts.net)
    setGross(amounts.gross)
    onChange?.({ ...amounts, vatRate: rate })
  }

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

  const handleVatRateChange = (newRate: number) => {
    setVatRate(newRate)

    const source = lastEdited ?? 'net'
    const sourceValue = source === 'net' ? net : gross

    // Only recompute if source has a value
    const amounts =
      sourceValue !== null
        ? computeAmounts(source, sourceValue, newRate)
        : { net, gross }

    commit(amounts, newRate)
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
