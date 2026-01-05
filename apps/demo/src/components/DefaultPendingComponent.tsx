import { Loader } from '@repo/ui/components'

export const DefaultPendingComponent = () => {
  return (
    <div className="grid h-svh w-full place-content-center">
      <Loader color="blue" size="xl" type="bars" />
    </div>
  )
}
