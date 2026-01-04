import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { InvoiceLine } from '@/features/invoicing/types'

import { invoiceApi } from './invoiceApi'
import { invoicingKeys } from './queryKeys'

/**
 * Mutation hook for updating all invoice lines.
 * Invalidates invoice queries on success.
 */
export function useUpdateInvoiceLinesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (lines: Array<Omit<InvoiceLine, 'id'> & { id?: string }>) =>
      invoiceApi.updateInvoiceLines(lines),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoicingKeys.invoice() })
    },
  })
}

/**
 * Mutation hook for removing an invoice line by ID.
 * Invalidates invoice queries on success.
 */
export function useRemoveInvoiceLineMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (lineId: string) => invoiceApi.removeInvoiceLine(lineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoicingKeys.invoice() })
    },
  })
}

/**
 * Mutation hook for adding a new empty invoice line.
 * Invalidates invoice queries on success.
 */
export function useAddInvoiceLineMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (vatRate?: number) => invoiceApi.addInvoiceLine(vatRate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoicingKeys.invoice() })
    },
  })
}
