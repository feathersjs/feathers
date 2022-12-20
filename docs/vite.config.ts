import fs from 'fs'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Unocss from 'unocss/vite'
import transformerDirective from '@unocss/transformer-directives'
import { presetAttributify, presetIcons, presetUno, presetTypography } from 'unocss'
import { resolve } from 'pathe'
import type { VitePluginPWAAPI } from 'vite-plugin-pwa'
import { VitePWA } from 'vite-plugin-pwa'
import fg from 'fast-glob'
import {
  pwaFontStylesRegex,
  pwaFontsRegex,
  feathersDescription,
  feathersName,
  feathersShortName
} from './.vitepress/meta'
import { optimizePages } from './.vitepress/scripts/assets'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { SearchPlugin } from 'vitepress-plugin-search'

const PWA = VitePWA({
  outDir: '.vitepress/dist',
  registerType: 'autoUpdate',
  // include all static assets under public/
  includeAssets: fg.sync('**/*.{png,svg,ico,txt}', { cwd: resolve(__dirname, 'public') }),
  manifest: {
    id: '/',
    name: feathersName,
    short_name: feathersShortName,
    description: feathersDescription,
    theme_color: '#ffffff',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: 'logo.svg',
        sizes: '165x165',
        type: 'image/svg',
        purpose: 'any maskable'
      }
    ]
  },
  workbox: {
    navigateFallbackDenylist: [/^\/new$/],
    runtimeCaching: [
      {
        urlPattern: pwaFontsRegex,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      {
        urlPattern: pwaFontStylesRegex,
        handler: 'CacheFirst',
        options: {
          cacheName: 'gstatic-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      }
    ]
  }
})

export default defineConfig({
  plugins: [
    SearchPlugin(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      include: [/\.vue/, /\.md/],
      dirs: '.vitepress/components',
      dts: '.vitepress/components.d.ts',
      resolvers: [ElementPlusResolver({ ssr: false })]
    }),
    Unocss({
      shortcuts: [
        [
          'btn',
          'px-4 py-1 rounded inline-flex justify-center gap-2 text-white leading-30px children:mya !no-underline cursor-pointer disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'
        ]
      ],
      presets: [
        presetUno({
          dark: 'media'
        }),
        presetAttributify(),
        presetIcons({
          scale: 1.2
        }),
        presetTypography()
      ],
      transformers: [transformerDirective()]
    }),
    IncludesPlugin(),
    PWA,
    {
      name: 'pwa:post',
      enforce: 'post',
      async buildEnd() {
        const pwaPlugin: VitePluginPWAAPI = PWA.find((i) => i.name === 'vite-plugin-pwa')?.api
        const pwa = pwaPlugin && !pwaPlugin.disabled
        await optimizePages(pwa)
        if (pwa) await pwaPlugin.generateSW()
      }
    }
  ],
  ssr: { noExternal: ['element-plus'] }
})

function IncludesPlugin(): Plugin {
  return {
    name: 'include-plugin',
    enforce: 'pre',
    transform(code, id) {
      let changed = false
      code = code.replace(/\[@@include\]\((.*?)\)/, (_, url) => {
        changed = true
        const full = resolve(id, url)
        return fs.readFileSync(full, 'utf-8')
      })
      if (changed) return code
    }
  }
}
