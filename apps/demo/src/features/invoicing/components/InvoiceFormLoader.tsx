import { useSuspenseQuery } from '@tanstack/react-query'

import {
  invoiceQueryOptions,
  vatRatesQueryOptions,
} from '@/features/invoicing/api/queries'
import { InvoiceForm } from '@/features/invoicing/components/InvoiceForm'

export const InvoiceFormLoader = () => {
  const { data: invoice } = useSuspenseQuery(invoiceQueryOptions)
  const { data: vatRates } = useSuspenseQuery(vatRatesQueryOptions)

  return <InvoiceForm invoice={invoice} vatRates={vatRates} />
}
