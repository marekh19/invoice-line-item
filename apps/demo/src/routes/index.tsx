import { Suspense } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Skeleton } from '@repo/ui/components'
import {
  invoiceQueryOptions,
  vatRatesQueryOptions,
} from '@/features/invoicing/api/queries'
import { InvoiceFormLoader } from '@/features/invoicing/components/InvoiceFormLoader'
import { cn } from '@/utils/cn'

export const Route = createFileRoute('/')({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(vatRatesQueryOptions),
      context.queryClient.ensureQueryData(invoiceQueryOptions),
    ])
  },
  component: App,
})

function App() {
  return (
    <div className={cn('p-4', 'lg:p-8 lg:max-w-5xl')}>
      <h1 className="text-2xl font-bold mb-6">Invoice Line Item Demo</h1>
      <Suspense fallback={<Skeleton height={200} radius="md" />}>
        <InvoiceFormLoader />
      </Suspense>
    </div>
  )
}
