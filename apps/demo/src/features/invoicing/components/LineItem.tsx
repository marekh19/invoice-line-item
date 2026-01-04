import { useId } from 'react'
import type { ReactNode } from 'react'
import { WrenchIcon } from 'lucide-react'
import {
  ActionIcon,
  Input,
  NumberInput,
  Select,
  Tooltip,
} from '@repo/ui/components'
import type { NumberInputProps } from '@repo/ui/components'

import { cn } from '@/utils/cn'

import {
  CURRENCY_DECIMALS,
  DEFAULT_LABELS,
  DEFAULT_VAT_RATES,
} from '@/features/invoicing/constants'
import { useLineItemState } from '@/features/invoicing/hooks/useLineItemState'
import type {
  FieldLabels,
  LineItemValue,
  UnitDisplay,
  VatRateOption,
} from '@/features/invoicing/types'
import { isGrossValid } from '@/features/invoicing/utils/validation'

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
  /** Slot for putting any action buttons after inputs. */
  children?: ReactNode
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
  children,
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

  const baseId = useId()
  const ids = {
    net: `${baseId}-net`,
    gross: `${baseId}-gross`,
    vatRate: `${baseId}-vatRate`,
  } as const

  return (
    <div
      className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-start gap-x-4 gap-y-1"
      data-testid="line-item"
    >
      {/* Row 1: Labels - explicitly placed in row 1 */}
      <Input.Label
        htmlFor={ids.net}
        className={cn(
          'col-start-1 row-start-1',
          !hasVisibleLabels && 'sr-only',
        )}
      >
        {labels.net}
      </Input.Label>
      <Input.Label
        htmlFor={ids.gross}
        className={cn(
          'col-start-2 row-start-1',
          !hasVisibleLabels && 'sr-only',
        )}
      >
        {labels.gross}
      </Input.Label>
      <Input.Label
        htmlFor={ids.vatRate}
        className={cn(
          'col-start-3 row-start-1',
          !hasVisibleLabels && 'sr-only',
        )}
      >
        {labels.vatRate}
      </Input.Label>
      <div className="col-start-4 row-start-1" aria-hidden="true" />

      {/* Row 2: inputs + actions - explicitly placed in row 2 */}
      <NumberInput
        id={ids.net}
        data-testid="line-item-net"
        className="col-start-1 row-start-2"
        value={net ?? undefined}
        onChange={handleNetChange}
        onBlur={handleNetBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleNetBlur()
          }
        }}
        disabled={disabled}
        readOnly={isReadOnly}
        {...commonInputProps}
      />
      <NumberInput
        id={ids.gross}
        data-testid="line-item-gross"
        className="col-start-2 row-start-2"
        value={gross ?? undefined}
        onChange={handleGrossChange}
        onBlur={handleGrossBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleGrossBlur()
          }
        }}
        disabled={disabled}
        readOnly={isReadOnly}
        error={hasInitialDataError}
        {...commonInputProps}
      />
      <Select
        id={ids.vatRate}
        data-testid="line-item-vat-rate"
        className="col-start-3 row-start-2"
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
      />
      <div className="col-start-4 row-start-2 flex items-center gap-1 self-center justify-self-end">
        {hasInitialDataError && (
          <Tooltip label={labels.fixButton}>
            <ActionIcon
              data-testid="line-item-fix-button"
              variant="filled"
              color="red"
              onClick={fixGross}
              disabled={disabled || isReadOnly}
              aria-label={labels.fixButton}
            >
              <WrenchIcon className="size-4" />
            </ActionIcon>
          </Tooltip>
        )}
        {children}
      </div>

      {/* Row 3: Field Errors - explicitly placed in row 3 */}
      <div className="col-start-1 row-start-3" aria-hidden="true" />
      <Input.Error className="col-start-2 row-start-3">
        {hasInitialDataError ? labels.grossError : undefined}
      </Input.Error>
      <div className="col-start-3 row-start-3" aria-hidden="true" />
      <div className="col-start-4 row-start-3" aria-hidden="true" />
    </div>
  )
}
