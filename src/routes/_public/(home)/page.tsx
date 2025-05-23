import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/(home)/')({
  component: HomePage,
})

function HomePage() {
  return null
}
