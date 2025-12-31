import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(cfg) {
    const { default: tailwindcss } = await import('@tailwindcss/vite')
    cfg.plugins = cfg.plugins || []
    cfg.plugins.push(tailwindcss())
    return cfg
  },
}
export default config
