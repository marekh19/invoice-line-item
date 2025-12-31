import { QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { RouterProvider } from '@tanstack/react-router'
import { router } from '@/integrations/tanstack-router/router'
import { queryClient } from '@/integrations/tanstack-query/queryClient'

export const Providers = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <RouterProvider router={router} />
      </MantineProvider>
    </QueryClientProvider>
  )
}
