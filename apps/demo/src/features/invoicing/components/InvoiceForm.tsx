import { PlusIcon, Trash2Icon } from 'lucide-react'
import { ActionIcon, Button, Switch, Tooltip } from '@repo/ui/components'
import type { Invoice, VatRateOption } from '@/features/invoicing/types'
import { LineItem } from '@/features/invoicing/components/LineItem'
import { useInvoiceForm } from '@/features/invoicing/hooks/useInvoiceForm'

type Props = {
  /** Invoice data from server */
  invoice: Invoice
  /** Available VAT rate options */
  vatRates: Array<VatRateOption>
}

/**
 * Invoice form component with edit mode toggle.
 *
 * Features:
 * - Toggle between read-only and editing modes
 * - Add/remove line items
 * - Submit all changes atomically
 * - Cancel to discard changes
 *
 * Uses react-hook-form with Zod validation and controlled `values` prop
 * to stay in sync with server data.
 */
export const InvoiceForm = ({ invoice, vatRates }: Props) => {
  const {
    form,
    isEditing,
    updateMutation,
    fields,
    setIsEditing,
    handleSubmit,
    handleCancel,
    handleAddLine,
    handleLineChange,
    handleRemove,
  } = useInvoiceForm({
    invoice,
    vatRates,
  })

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        {/* Edit mode toggle */}
        <div className="flex justify-between items-center">
          <Switch
            label="Edit mode"
            checked={isEditing}
            onChange={(e) => setIsEditing(e.currentTarget.checked)}
            disabled={updateMutation.isPending}
          />
          {isEditing && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" loading={updateMutation.isPending}>
                Save changes
              </Button>
            </div>
          )}
        </div>

        {/* Line items */}
        <div className="flex flex-col gap-2">
          {fields.map((field, index) => (
            <div key={field._fieldId} className="flex gap-1 items-center">
              <LineItem
                value={field}
                vatRates={vatRates}
                unit={{ suffix: 'Kč' }}
                hasVisibleLabels={index === 0}
                isReadOnly={!isEditing}
                onChange={(newValue) => handleLineChange(index, newValue)}
              >
                {isEditing && (
                  <Tooltip label="Remove line">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleRemove(index)}
                      disabled={fields.length <= 1}
                      aria-label="Remove line"
                    >
                      <Trash2Icon className="size-4" />
                    </ActionIcon>
                  </Tooltip>
                )}
              </LineItem>
            </div>
          ))}
        </div>

        {/* Add line button */}
        {isEditing && (
          <Button
            variant="light"
            leftSection={<PlusIcon className="size-4" />}
            onClick={handleAddLine}
            disabled={updateMutation.isPending}
          >
            Add line
          </Button>
        )}

        {/* Form error */}
        {form.formState.errors.lines?.message && (
          <p className="text-red-500 text-sm">
            {form.formState.errors.lines.message}
          </p>
        )}
      </div>
    </form>
  )
}
