import { useSuspenseQuery } from '@tanstack/react-query'
import { LineItem } from './LineItem'
import {
  invoiceQueryOptions,
  vatRatesQueryOptions,
} from '@/features/invoicing/api/queries'

export const InvoiceLinesList = () => {
  const { data: invoice } = useSuspenseQuery(invoiceQueryOptions)
  const { data: vatRates } = useSuspenseQuery(vatRatesQueryOptions)

  return (
    <div className="flex flex-col gap-4">
      {invoice.lines.map((line, index) => (
        <LineItem
          key={line.id}
          value={line}
          vatRates={vatRates}
          unit={{ suffix: 'Kč' }}
          hasVisibleLabels={index === 0}
          onChange={(value) => console.log('Line changed:', line.id, value)}
        />
      ))}
    </div>
  )
}
