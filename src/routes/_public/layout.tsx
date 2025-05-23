import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { ROUTES } from '@/router'

export const Route = createFileRoute('/_public')({
  component: PublicLayout,
  beforeLoad() {
    throw redirect({
      to: ROUTES.DASHBOARD.HOME,
      replace: true,
    })
  },
})

function PublicLayout() {
  return <Outlet />
}
