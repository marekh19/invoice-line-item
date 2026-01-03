import { Loader } from '@mantine/core'

export function DefaultPendingComponent() {
  return (
    <div className="grid place-content-center size-screen">
      <Loader color="blue" size="xl" type="bars" />
    </div>
  )
}
