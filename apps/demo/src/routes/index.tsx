import { createFileRoute } from '@tanstack/react-router'
import { LineItem } from '@/features/invoicing/components/LineItem'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Invoice Line Item Demo</h1>
      <LineItem
        value={{ net: 100, gross: 200, vatRate: 21 }}
        unit={{ suffix: 'Kč' }}
        onChange={(value) => console.log('LineItem changed:', value)}
      />
    </div>
  )
}
