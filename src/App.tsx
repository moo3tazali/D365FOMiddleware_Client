import { RouterProvider } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'

import { router } from './router'
import { AppProviders } from '@/providers'

export function App() {
  return (
    <AppProviders>
      <InnerApp />
    </AppProviders>
  )
}

function InnerApp() {
  const queryClient = useQueryClient()

  return <RouterProvider router={router} context={{ queryClient }} />
}
