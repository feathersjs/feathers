import { defineCollection, defineContentConfig } from '@nuxt/content'
import { menuSchema } from './content.config.schema'

export default defineContentConfig({
  collections: {
    // Site Pages and Menus
    pages: defineCollection({
      type: 'page',
      source: 'pages/**/*.md',
    }),
    menus: defineCollection({
      type: 'data',
      source: 'menus/**/*.json',
      schema: menuSchema,
    }),

    // Feathers Documentation
    docs: defineCollection({
      type: 'page',
      source: 'docs/**/*.md',
    }),
  },
})
