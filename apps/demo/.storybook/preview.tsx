import { MantineProvider } from '@mantine/core'
import type { Preview } from '@storybook/react-vite'
import '@/styles/global.css'

export default {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <MantineProvider>
        <Story />
      </MantineProvider>
    ),
  ],
} satisfies Preview
