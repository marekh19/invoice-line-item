import { createFileRoute } from '@tanstack/react-router'
import { LineItem } from '@/features/invoicing/components/LineItem'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return <LineItem />
}
