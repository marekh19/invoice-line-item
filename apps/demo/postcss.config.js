import postCssConfig from '@repo/ui/postcss.config'

export default {
  plugins: {
    '@tailwindcss/postcss': {},
    ...postCssConfig.plugins,
  },
}
