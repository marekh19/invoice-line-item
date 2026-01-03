import { NumberInput } from '@repo/ui/components/NumberInput'
import { Select } from '@repo/ui/components/Select'
import { useLineItemState } from '../hooks/useLineItemState'
import { formatForDisplay } from '../utils/money'
import type { LineItemValue, VatRateOption } from '../types'
import type { NumberInputProps } from '@mantine/core'

type UnitDisplay = {
  prefix?: string
  suffix?: string
}

/**
 * Default VAT rate options available in the dropdown.
 */
const DEFAULT_VAT_RATES: Array<VatRateOption> = [
  { value: 0, label: '0%' },
  { value: 5, label: '5%' },
  { value: 10, label: '10%' },
  { value: 15, label: '15%' },
  { value: 21, label: '21%' },
  { value: 25, label: '25%' },
]

const commonInputPropsFactory = (
  unit?: UnitDisplay,
): Partial<NumberInputProps> => ({
  decimalScale: 2,
  fixedDecimalScale: true,
  thousandSeparator: ',',
  placeholder: '0.00',
  min: 0,
  ...unit,
})

export interface LineItemProps {
  /** Initial/controlled value for the line item */
  value: LineItemValue
  /** Available VAT rate options. Defaults to common rates. */
  vatRates?: Array<VatRateOption>
  /** Callback when values change (on commit: blur or rate change) */
  onChange?: (value: LineItemValue) => void
  /** If true, inputs are disabled */
  disabled?: boolean
  /* Optional unit suffix / prefix to be displayed */
  unit?: UnitDisplay
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
export function LineItem({
  value,
  vatRates = DEFAULT_VAT_RATES,
  onChange,
  disabled = false,
  unit,
}: LineItemProps) {
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
        label="Net amount"
        value={formatForDisplay(net)}
        onChange={handleNetChange}
        onBlur={handleNetBlur}
        disabled={disabled}
        {...commonInputProps}
      />
      <NumberInput
        label="Gross amount"
        value={formatForDisplay(gross)}
        onChange={handleGrossChange}
        onBlur={handleGrossBlur}
        disabled={disabled}
        {...commonInputProps}
      />
      <Select
        label="VAT rate"
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
