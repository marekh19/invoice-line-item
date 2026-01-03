import { defineConfig } from 'eslint/config'
import { tanstackConfig } from '@tanstack/eslint-config'
import reactHooks from 'eslint-plugin-react-hooks'

export default defineConfig([
  { ignores: ['*.config.{js,ts}', 'storybook-static'] },
  ...tanstackConfig,
  reactHooks.configs.flat['recommended-latest'],
])
