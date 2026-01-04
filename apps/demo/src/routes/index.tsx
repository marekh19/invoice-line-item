import { Suspense } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Skeleton } from '@repo/ui/components'

import { cn } from '@/utils/cn'

import {
  invoiceQueryOptions,
  vatRatesQueryOptions,
} from '@/features/invoicing/api/queries'
import { InvoiceFormLoader } from '@/features/invoicing/components/InvoiceFormLoader'

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
    <div className={cn('p-4', 'lg:max-w-5xl lg:p-8')}>
      <h1 className="mb-6 text-2xl font-bold">Invoice Line Item Demo</h1>
      <Suspense fallback={<Skeleton height={200} radius="md" />}>
        <InvoiceFormLoader />
      </Suspense>
    </div>
  )
}
