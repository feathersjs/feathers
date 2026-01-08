import { defineConfig } from 'vitepress'
import { discord, font, github, ogImage, ogUrl, x, feathersDescription, feathersName } from './meta'
import sidebar from './config.sidebar'
import nav from './config.nav'

// For sitemap/search
import { createWriteStream } from 'node:fs'
import { SitemapStream } from 'sitemap'
import { resolve } from 'node:path'
const links: any[] = []

export default defineConfig({
  lang: 'en-US',
  title: feathersName,
  description: feathersDescription,
  head: [
    ['meta', { name: 'theme-color', content: '#ffffff' }],
    ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'alternate icon', href: '/favicon.ico', type: 'image/png', sizes: '16x16' }],
    [
      'meta',
      {
        name: 'author',
        content: `daffl, marshallswain, and FeathersJS contributors`
      }
    ],
    [
      'meta',
      {
        name: 'keywords',
        content:
          'feathersjs, feathers, react, vue, preact, svelte, solid, typescript, esm, node, deno, cloudflare, workers'
      }
    ],
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
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' }]
  ],
  lastUpdated: true,
  markdown: {
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark'
    }
  },
  themeConfig: {
    logo: '/logo.svg',

    editLink: {
      pattern: 'https://github.com/feathersjs/feathers/edit/dove/docs/:path',
      text: 'Suggest changes to this page'
    },

    socialLinks: [
      {
        icon: {
          svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.244 2H21l-6.5 7.43L22 22h-6.1l-4.77-6.23L5.7 22H3l6.93-7.9L2 2h6.25l4.3 5.6L18.244 2zm-2.14 18h1.7L7.1 4h-1.8l10.8 16z"/></svg>`
        },
        link: x
      },
      { icon: 'discord', link: discord },
      { icon: 'github', link: github }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: `Copyright © 2012-${new Date().getFullYear()} FeathersJS contributors`
    },

    nav,
    sidebar
  },
  // for sitemap/search
  transformHtml: (_: any, id: any, { pageData }: any) => {
    if (!/[\\/]404\.html$/.test(id))
      links.push({
        // you might need to change this if not using clean urls mode
        url: pageData.relativePath.replace(/((^|\/)index)?\.md$/, '$2'),
        lastmod: pageData.lastUpdated
      })
  },
  // for sitemap/search
  buildEnd: async ({ outDir }) => {
    const sitemap = new SitemapStream({
      hostname: 'https://dove.feathersjs.com/'
    })
    const writeStream = createWriteStream(resolve(outDir, 'sitemap.xml'))
    sitemap.pipe(writeStream)
    links.forEach((link) => sitemap.write(link))
    sitemap.end()
    await new Promise((r) => writeStream.on('finish', r))
  }
})
