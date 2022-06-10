import { defineConfig } from 'vitepress'
// import { version } from '../package.json'
const version = 5
import {
  contributing,
  discord,
  font,
  github,
  ogImage,
  ogUrl,
  releases,
  twitter,
  feathersDescription,
  feathersName,
} from './meta'
import { teamMembers } from './contributors'

export default defineConfig({
  lang: 'en-US',
  title: feathersName,
  description: feathersDescription,
  head: [
    ['meta', { name: 'theme-color', content: '#ffffff' }],
    ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'alternate icon', href: '/favicon.ico', type: 'image/png', sizes: '16x16' }],
    ['meta', { name: 'author', content: `${teamMembers.map(c => c.name).join(', ')} and ${feathersName} contributors` }],
    ['meta', { name: 'keywords', content: 'feathersjs, feathers, react, vue, preact, svelte, solid, typescript, esm, node, deno, cloudflare, workers' }],
    ['meta', { property: 'og:title', content: feathersName }],
    ['meta', { property: 'og:description', content: feathersDescription }],
    ['meta', { property: 'og:url', content: ogUrl }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { name: 'twitter:title', content: feathersName }],
    ['meta', { name: 'twitter:description', content: feathersDescription }],
    ['meta', { name: 'twitter:image', content: ogImage }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['link', { href: font, rel: 'stylesheet' }],
    ['link', { rel: 'mask-icon', href: '/logo.svg', color: '#ffffff' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' }],
  ],
  lastUpdated: true,
  markdown: {
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
  },
  themeConfig: {
    logo: '/logo.svg',

    editLink: {
      repo: 'feathersjs/feathers',
      branch: 'dove',
      dir: 'docs',
      text: 'Suggest changes to this page',
    },

    algolia: {
      appId: 'QK3SV4AQ1E',
      apiKey: '3e8a4c82e7a1b57cd1a4809ceb86878e',
      indexName: 'feathersjs'
      // searchParameters: {
      //   facetFilters: ['tags:en'],
      // },
    },

    // localeLinks: {
    //   text: 'English',
    //   items: [
    //     { text: '简体中文', link: 'https://cn.vitest.dev' },
    //   ],
    // },

    socialLinks: [
      { icon: 'twitter', link: twitter },
      { icon: 'discord', link: discord },
      { icon: 'github', link: github },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2012-PRESENT FeathersJS contributors',
    },

    nav: [
      { text: 'Guides', link: '/guides/readme' },
      { text: 'API', link: '/api/' },
      {
        text: `v${version}`,
        items: [
          {
            text: 'Release Notes ',
            link: releases,
          },
          {
            text: 'Crow v4 ',
            link: releases,
          },
          {
            text: 'Buzzard v3 ',
            link: contributing,
          },
        ],
      },
      { text: 'Blog', link: '/api/' },
    ],

    sidebar: {
      // TODO: bring sidebar of apis and config back
      '/guides': [
        {
          text: 'The Feathers Guide',
          collapsible: true,
          items: [
            {
              text: 'Getting Ready',
              link: '/guides/basics/setup.md',
            },
            {
              text: 'Quick start',
              link: '/guides/basics/starting.md',
            },
            {
              text: 'Generating an App',
              link: '/guides/basics/generator.md',
            },
            {
              text: 'Services',
              link: '/guides/basics/services.md',
            },
            {
              text: 'Hooks',
              link: '/guides/basics/hooks.md',
            },
            {
              text: 'Authentication',
              link: '/guides/basics/authentication.md',
            },

            {
              text: 'Building a Frontend',
              link: '/guides/basics/frontend.md',
            },
            {
              text: 'Writing Tests',
              link: '/guides/basics/testing.md',
            },
          ],
        },
        {
          text: 'Advanced Topics',
          collapsible: true,
          items: [
            {
              text: 'Front-End Frameworks',
              link: '/guides/frameworks.md',
            },
            {
              text: 'Security',
              link: '/guides/security.md',
            },
            {
              text: 'Migration Guide',
              link: '/guides/migrating.md',
            },
          ],
        },
      ],
    },
  },
})
