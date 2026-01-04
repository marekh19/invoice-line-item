import type { ChangeEvent } from 'react'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { ActionIcon, Button, Switch, Tooltip } from '@repo/ui/components'

import { LineItem } from '@/features/invoicing/components/LineItem'
import { useInvoiceForm } from '@/features/invoicing/hooks/useInvoiceForm'
import type { Invoice, VatRateOption } from '@/features/invoicing/types'

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

  const handleSwitchEditMode = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.checked) {
      setIsEditing(true)
      return
    }
    handleCancel()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        {/* Edit mode toggle */}
        <div className="flex h-10 items-center justify-between">
          <Switch
            label="Edit mode"
            checked={isEditing}
            onChange={handleSwitchEditMode}
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
            <div key={field._fieldId} className="flex items-center gap-1">
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
          <p className="text-sm text-red-500">
            {form.formState.errors.lines.message}
          </p>
        )}
      </div>
    </form>
  )
}
