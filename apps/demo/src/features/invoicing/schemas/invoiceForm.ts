import { z } from 'zod'

/**
 * Schema for a single invoice line item.
 */
const lineItemSchema = z.object({
  id: z.string(),
  net: z.number().nullable(),
  gross: z.number().nullable(),
  vatRate: z.number(),
})

/**
 * Schema for the invoice form containing multiple line items.
 */
export const invoiceFormSchema = z.object({
  lines: z.array(lineItemSchema).min(1, 'At least one line item is required'),
})

export type InvoiceFormSchema = z.infer<typeof invoiceFormSchema>
