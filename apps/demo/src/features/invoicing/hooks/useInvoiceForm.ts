import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'

import { useUpdateInvoiceLinesMutation } from '@/features/invoicing/api/mutations'
import { invoiceFormSchema } from '@/features/invoicing/schemas/invoiceForm'
import type {
  Invoice,
  LineItemValue,
  VatRateOption,
} from '@/features/invoicing/types'

type Props = {
  /** Invoice data from server */
  invoice: Invoice
  /** Available VAT rate options */
  vatRates: Array<VatRateOption>
}

export const useInvoiceForm = ({ invoice, vatRates }: Props) => {
  const [isEditing, setIsEditing] = useState(false)
  const updateMutation = useUpdateInvoiceLinesMutation()

  const defaultVatRate = vatRates.at(0)?.value ?? 0

  const form = useForm({
    resolver: zodResolver(invoiceFormSchema),
    values: { lines: invoice.lines },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lines',
    keyName: '_fieldId', // Avoid conflict with our `id` field
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    await updateMutation.mutateAsync(data.lines)
    setIsEditing(false)
  })

  const handleCancel = () => {
    form.reset()
    setIsEditing(false)
  }

  const handleAddLine = () => {
    append({
      id: crypto.randomUUID(),
      net: null,
      gross: null,
      vatRate: defaultVatRate,
    })
  }

  const handleLineChange = (index: number, newValue: LineItemValue) => {
    const currentLine = form.getValues(`lines.${index}`)
    form.setValue(`lines.${index}`, {
      ...currentLine,
      ...newValue,
    })
  }

  return {
    form,
    isEditing,
    updateMutation,
    fields,
    setIsEditing,
    handleSubmit,
    handleCancel,
    handleAddLine,
    handleLineChange,
    handleRemove: remove,
  }
}
