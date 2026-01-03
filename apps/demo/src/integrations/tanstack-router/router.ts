import { createRouter } from '@tanstack/react-router'
import { DefaultPendingComponent } from '@/components/DefaultPendingComponent'
import { routeTree } from '@/routeTree.gen'
import { queryClient } from '@/integrations/tanstack-query/queryClient'

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  defaultPendingComponent: DefaultPendingComponent,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
