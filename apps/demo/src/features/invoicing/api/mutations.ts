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
