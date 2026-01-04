import { tanstackConfig } from '@tanstack/eslint-config'
import reactHooks from 'eslint-plugin-react-hooks'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  { ignores: ['*.config.{js,ts}', 'storybook-static'] },
  ...tanstackConfig,
  reactHooks.configs.flat['recommended-latest'],
  {
    rules: {
      'import/order': 'off',
      'sort-imports': 'off',
    },
  },
])
