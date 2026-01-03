import { useSuspenseQuery } from '@tanstack/react-query'
import { InvoiceForm } from './InvoiceForm'
import {
  invoiceQueryOptions,
  vatRatesQueryOptions,
} from '@/features/invoicing/api/queries'

export const InvoiceFormLoader = () => {
  const { data: invoice } = useSuspenseQuery(invoiceQueryOptions)
  const { data: vatRates } = useSuspenseQuery(vatRatesQueryOptions)

  return <InvoiceForm invoice={invoice} vatRates={vatRates} />
}
