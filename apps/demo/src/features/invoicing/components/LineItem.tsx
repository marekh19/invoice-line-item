import { NumberInput } from '@repo/ui/components/NumberInput'
import { Select } from '@repo/ui/components/Select'

export const LineItem = () => {
  return (
    <div className="max-w-lg flex gap-6 mx-auto">
      <NumberInput />
      <NumberInput />
      <Select />
    </div>
  )
}
