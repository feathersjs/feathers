// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ['@feathersdev/websites'],

  nitro: {
    preset: 'cloudflare-module'
  },

  app: {
    head: {
      title: 'FeathersJS',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }]
    }
  },

  css: ['~/assets/css/main.css'],

  devServer: {
    port: 3009
  }
})
