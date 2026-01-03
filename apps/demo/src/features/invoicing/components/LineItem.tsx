import { NumberInput } from '@repo/ui/components/NumberInput'
import { Select } from '@repo/ui/components/Select'
import type { NumberInputProps } from '@mantine/core'
import type {
  FieldLabels,
  LineItemValue,
  UnitDisplay,
  VatRateOption,
} from '@/features/invoicing/types'
import { formatForDisplay } from '@/features/invoicing/utils/money'
import { useLineItemState } from '@/features/invoicing/hooks/useLineItemState'
import {
  CURRENCY_DECIMALS,
  DEFAULT_LABELS,
  DEFAULT_VAT_RATES,
} from '@/features/invoicing/constants'

const commonInputPropsFactory = (
  unit?: UnitDisplay,
): Partial<NumberInputProps> => ({
  decimalScale: CURRENCY_DECIMALS,
  fixedDecimalScale: true,
  thousandSeparator: ',',
  placeholder: '0.00',
  min: 0,
  ...unit,
})

type Props = {
  /** Initial/controlled value for the line item */
  value: LineItemValue
  /** Available VAT rate options. Defaults to common rates. */
  vatRates?: ReadonlyArray<VatRateOption>
  /** Callback when values change (on commit: blur or rate change) */
  onChange?: (value: LineItemValue) => void
  /** If true, inputs are disabled */
  disabled?: boolean
  /* Optional unit suffix / prefix to be displayed */
  unit?: UnitDisplay
  /* Field labels. Defaults to predefined ones */
  labels?: FieldLabels
}

/**
 * A line item component for invoice editing with VAT calculations.
 *
 * Features:
 * - Enter net or gross amount
 * - Select VAT rate from predefined options
 * - Automatic recalculation of the other amount
 * - Precise decimal math using big.js
 *
 * ## Behavior
 *
 * - When net is edited and blurred, gross is recalculated
 * - When gross is edited and blurred, net is recalculated
 * - When VAT rate changes, the "other" field is recalculated
 *   based on which field was last edited (default: net)
 * - Clearing a field and blurring clears both fields
 *
 * @example
 * <LineItem
 *   value={{ net: 100, gross: 121, vatRate: 21 }}
 *   onChange={(value) => console.log('Updated:', value)}
 * />
 */
export const LineItem = ({
  value,
  vatRates = DEFAULT_VAT_RATES,
  onChange,
  disabled = false,
  unit,
  labels = DEFAULT_LABELS,
}: Props) => {
  const {
    net,
    gross,
    vatRate,
    handleNetChange,
    handleGrossChange,
    handleNetBlur,
    handleGrossBlur,
    handleVatRateChange,
  } = useLineItemState({
    initialValue: value,
    onChange,
  })

  // Convert VAT rates to Mantine Select format (requires string values)
  const selectData = vatRates.map((rate) => ({
    value: String(rate.value),
    label: rate.label,
  }))

  const commonInputProps = commonInputPropsFactory(unit)

  return (
    <div className="flex gap-4 items-end">
      <NumberInput
        label={labels.net}
        value={formatForDisplay(net)}
        onChange={handleNetChange}
        onBlur={handleNetBlur}
        disabled={disabled}
        {...commonInputProps}
      />
      <NumberInput
        label={labels.gross}
        value={formatForDisplay(gross)}
        onChange={handleGrossChange}
        onBlur={handleGrossBlur}
        disabled={disabled}
        {...commonInputProps}
      />
      <Select
        label={labels.vatRate}
        value={String(vatRate)}
        onChange={(selectedValue) => {
          if (selectedValue !== null) {
            handleVatRateChange(Number(selectedValue))
          }
        }}
        data={selectData}
        disabled={disabled}
        allowDeselect={false}
      />
    </div>
  )
}
