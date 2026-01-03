import { Suspense } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Skeleton } from '@mantine/core'
import {
  invoiceQueryOptions,
  vatRatesQueryOptions,
} from '@/features/invoicing/api/queries'
import { InvoiceLinesList } from '@/features/invoicing/components/InvoiceLinesList'

export const Route = createFileRoute('/')({
  loader: async ({ context }) => {
    // Prefetch data in parallel
    await Promise.all([
      context.queryClient.ensureQueryData(vatRatesQueryOptions),
      context.queryClient.ensureQueryData(invoiceQueryOptions),
    ])
  },
  component: App,
})

function App() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Invoice Line Item Demo</h1>
      <Suspense fallback={<Skeleton height={80} radius="md" />}>
        <InvoiceLinesList />
      </Suspense>
    </div>
  )
}
