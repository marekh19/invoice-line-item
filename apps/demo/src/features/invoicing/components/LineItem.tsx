import { WrenchIcon } from 'lucide-react'
import { ActionIcon, NumberInput, Select, Tooltip } from '@repo/ui/components'
import type { NumberInputProps } from '@repo/ui/components'
import type {
  FieldLabels,
  LineItemValue,
  UnitDisplay,
  VatRateOption,
} from '@/features/invoicing/types'
import { isGrossValid } from '@/features/invoicing/utils/validation'
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
  /** Optional unit suffix / prefix to be displayed */
  unit?: UnitDisplay
  /** Field labels. Defaults to predefined ones */
  labels?: FieldLabels
  /**
   * If true (default), labels are visible above inputs.
   * If false, labels are hidden and used as aria-labels instead.
   * Useful when rendering multiple rows where labels would be redundant.
   */
  hasVisibleLabels?: boolean
  /** If true fields are not editable but not disabled. False by default. */
  isReadOnly?: boolean
}

/**
 * A line item component for invoice editing with VAT calculations.
 *
 * Features:
 * - Enter net or gross amount
 * - Select VAT rate from predefined options
 * - Automatic recalculation of the other amount
 * - Precise decimal math using big.js
 * - Validation indicator for inconsistent data from server
 *
 * ## Behavior
 *
 * - When net is edited and blurred, gross is recalculated
 * - When gross is edited and blurred, net is recalculated
 * - When VAT rate changes, gross is recalculated from net
 * - Clearing a field and blurring clears both fields
 * - If initial data is inconsistent, a red indicator and fix button appear
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
  hasVisibleLabels = true,
  isReadOnly = false,
}: Props) => {
  const {
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
  } = useLineItemState({
    value,
    onChange,
  })

  // Only validate initial data from props, not during user editing
  // Once user interacts, we trust their input
  const hasInitialDataError =
    !hasUserInteracted && !isGrossValid(value.net, value.gross, value.vatRate)

  // Convert VAT rates to Mantine Select format (requires string values)
  const selectData = vatRates.map((rate) => ({
    value: String(rate.value),
    label: rate.label,
  }))

  const commonInputProps = commonInputPropsFactory(unit)

  // When labels are hidden, use them as aria-labels for accessibility
  const labelProps = hasVisibleLabels
    ? {
        net: { label: labels.net },
        gross: { label: labels.gross },
        vatRate: { label: labels.vatRate },
      }
    : {
        net: { 'aria-label': labels.net },
        gross: { 'aria-label': labels.gross },
        vatRate: { 'aria-label': labels.vatRate },
      }

  return (
    <div className="flex gap-4 items-start" data-testid="line-item">
      <NumberInput
        data-testid="line-item-net"
        value={net ?? undefined}
        onChange={handleNetChange}
        onBlur={handleNetBlur}
        disabled={disabled}
        readOnly={isReadOnly}
        {...labelProps.net}
        {...commonInputProps}
      />
      <NumberInput
        data-testid="line-item-gross"
        value={gross ?? undefined}
        onChange={handleGrossChange}
        onBlur={handleGrossBlur}
        disabled={disabled}
        readOnly={isReadOnly}
        error={hasInitialDataError ? labels.grossError : undefined}
        {...labelProps.gross}
        {...commonInputProps}
      />
      <Select
        data-testid="line-item-vat-rate"
        value={String(vatRate)}
        onChange={(selectedValue) => {
          if (selectedValue !== null) {
            handleVatRateChange(Number(selectedValue))
          }
        }}
        data={selectData}
        disabled={disabled}
        readOnly={isReadOnly}
        allowDeselect={false}
        {...labelProps.vatRate}
      />
      {hasInitialDataError && (
        <Tooltip label={labels.fixButton}>
          <ActionIcon
            data-testid="line-item-fix-button"
            variant="filled"
            color="red"
            onClick={fixGross}
            disabled={disabled}
            aria-label={labels.fixButton}
            className="self-end mb-6"
          >
            <WrenchIcon className="size-4" />
          </ActionIcon>
        </Tooltip>
      )}
    </div>
  )
}
