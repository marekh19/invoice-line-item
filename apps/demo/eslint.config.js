//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  { ignores: ['postcss.config.js'] },
  ...tanstackConfig,
]
