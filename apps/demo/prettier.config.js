/** @type {import('prettier').Config} */
const config = {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  plugins: [
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
  ],
  tailwindFunctions: ['cva', 'cn'],
  tailwindStylesheet: './src/styles/global.css',
  importOrder: [
    '^(react/(.*)$)|^(react$)',
    '<THIRD_PARTY_MODULES>',
    '^@repo/(.*)$',
    '',
    '^@/(?!features/)(.*)$', // Everything from @/ except features
    '',
    '^@/features/(.*)$', // Everything from @/features
    '',
    '^[./]',
  ],
}

export default config
