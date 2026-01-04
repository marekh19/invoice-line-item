import { Loader } from '@mantine/core'

export function DefaultPendingComponent() {
  return (
    <div className="size-screen grid place-content-center">
      <Loader color="blue" size="xl" type="bars" />
    </div>
  )
}
