import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

import { queryDevTools } from '@/integrations/tanstack-query/DevTools'
import { routerDevTools } from '@/integrations/tanstack-router/DevTools'

import '@/styles/global.css'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <Outlet />
      <TanStackDevtools
        config={{ position: 'bottom-right' }}
        plugins={[queryDevTools, routerDevTools]}
      />
    </>
  )
}
