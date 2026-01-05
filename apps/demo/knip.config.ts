import type { KnipConfig } from 'knip'

export default {
  entry: ['src/main.tsx'],
  project: ['src/**/*.{ts,tsx}'],
  ignoreDependencies: ['@repo/ui', 'tailwindcss', 'wrangler'],
} satisfies KnipConfig
