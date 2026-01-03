import { queryOptions } from '@tanstack/react-query'
import { invoiceApi } from './invoiceApi'
import { invoicingKeys } from './queryKeys'

/**
 * Query options for fetching available VAT rates.
 */
export const vatRatesQueryOptions = queryOptions({
  queryKey: invoicingKeys.vatRates(),
  queryFn: () => invoiceApi.getVatRates(),
  staleTime: Infinity, // VAT rates rarely change
})

/**
 * Query options for fetching the invoice with all line items.
 */
export const invoiceQueryOptions = queryOptions({
  queryKey: invoicingKeys.invoice(),
  queryFn: () => invoiceApi.getInvoice(),
})

/**
 * Query options for fetching just the invoice lines.
 */
export const invoiceLinesQueryOptions = queryOptions({
  queryKey: invoicingKeys.invoiceLines(),
  queryFn: () => invoiceApi.getInvoiceLines(),
})
