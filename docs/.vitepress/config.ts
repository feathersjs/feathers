import { defineConfig } from 'vitepress'
// import { version } from '../package.json'
import { highlight } from './highlight'
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
  feathersName
} from './meta'
import { teamMembers } from './contributors'

const comparisonSidebar = [
  {
    text: 'Compare Feathers',
    items: [
      {
        text: 'Overview',
        link: '/comparison'
      },
      {
        text: 'Feathers vs Firebase',
        link: '/feathers-vs-firebase'
      },
      {
        text: 'Feathers vs Meteor',
        link: '/feathers-vs-meteor'
      },
      {
        text: 'Feathers vs Sails',
        link: '/feathers-vs-sails'
      },
      {
        text: 'Feathers vs Loopback',
        link: '/feathers-vs-loopback'
      }
    ]
  }
]

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
        content: `${teamMembers.map((c) => c.name).join(', ')} and ${feathersName} contributors`
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
    config: async (md) => {
      md.set({
        highlight: await highlight({
          light: 'vitesse-light',
          dark: 'vitesse-dark'
        })
      })

      return md
    },
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark'
    }
  },
  themeConfig: {
    logo: '/logo.svg',

    editLink: {
      pattern: 'https://github.com/feathersjs/feathers/edit/dove-docs/docs/:path',
      text: 'Suggest changes to this page'
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
      { icon: 'github', link: github }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2012-PRESENT FeathersJS contributors'
    },

    nav: [
      { text: 'Guides', link: '/guides/' },
      { text: 'API', link: '/api/' },
      { text: 'Help', link: '/help/' },
      {
        text: `v${version}`,
        items: [
          {
            text: 'Release Notes ',
            link: releases
          },
          {
            text: 'Crow v4 ',
            link: releases
          },
          {
            text: 'Buzzard v3 ',
            link: contributing
          }
        ]
      },
      {
        text: 'Awesome',
        link: '/awesome/'
      },
      {
        text: 'Ecosystem',
        items: [
          { text: 'Blog', link: 'https://blog.feathersjs.com/' },
          { text: 'Cookbook', link: '/cookbook/' },
          {
            text: 'Awesome Feathers',
            link: 'https://github.com/feathersjs/awesome-feathersjs'
          },
          {
            text: 'YouTube Playlist',
            link: 'https://www.youtube.com/playlist?list=PLwSdIiqnDlf_lb5y1liQK2OW5daXYgKOe'
          },
          {
            text: 'Feathers Pinia - Vue',
            link: 'https://feathers-pinia.pages.dev/'
          },
          {
            text: 'Figbird - React',
            link: 'https://humaans.github.io/figbird/'
          },
          {
            text: 'Common Hooks',
            link: 'https://hooks-common.feathersjs.com/'
          }
        ]
      }
    ],

    sidebar: {
      '/guides': [
        {
          text: 'Getting Started',
          collapsible: true,
          items: [
            {
              text: 'Getting Ready',
              link: '/guides/basics/setup.md'
            },
            {
              text: 'Quick start',
              link: '/guides/basics/starting.md'
            },
            {
              text: 'Generating an App',
              link: '/guides/basics/generator.md'
            },
            {
              text: 'Services',
              link: '/guides/basics/services.md'
            },
            {
              text: 'Hooks',
              link: '/guides/basics/hooks.md'
            },
            {
              text: 'Schemas',
              link: '/guides/basics/schemas.md'
            },
            {
              text: 'Authentication',
              link: '/guides/basics/authentication.md'
            },
            {
              text: 'Writing Tests',
              link: '/guides/basics/testing.md'
            }
          ]
        },
        {
          text: 'Frontend',
          collapsible: true,
          collapsed: true,
          items: [
            {
              text: 'JavaScript',
              link: '/guides/frontend/javascript.md'
            },
            // {
            //   text: 'React',
            //   link: '/guides/frontend/react.md'
            // },
            // {
            //   text: 'VueJS',
            //   link: '/guides/frontend/vuejs.md'
            // },
            {
              text: 'More',
              link: '/guides/frameworks.md'
            }
          ]
        },
        {
          text: 'The Feathers CLI',
          collapsible: true,
          collapsed: true,
          items: [
            {
              text: 'Overview',
              link: '/guides/cli/index.md'
            },
            {
              text: 'Structure',
              link: '/guides/cli/structure.md'
            },
            {
              text: 'Customization',
              link: '/guides/cli/customization.md'
            },
            {
              text: 'TypeScript',
              link: '/guides/cli/typescript.md'
            }
          ]
        },
        {
          text: 'More',
          collapsible: true,
          items: [
            {
              text: "What's New in Dove",
              link: '/guides/whats-new-in-dove.md'
            },
            {
              text: 'Migration Guide',
              link: '/guides/migrating.md'
            },
            {
              text: 'Troubleshooting',
              link: '/guides/troubleshooting.md'
            }
          ]
        }
      ],
      '/api': [
        {
          text: 'Core',
          collapsible: true,
          items: [
            {
              text: 'Application',
              link: '/api/application'
            },
            {
              text: 'Services',
              link: '/api/services'
            },
            {
              text: 'Hooks',
              link: '/api/hooks'
            },
            {
              text: 'Events',
              link: '/api/events'
            },
            {
              text: 'Errors',
              link: '/api/errors'
            }
          ]
        },
        {
          text: 'Transports',
          collapsible: true,
          collapsed: true,
          items: [
            {
              text: 'Configuration',
              link: '/api/configuration'
            },
            {
              text: 'Koa',
              link: '/api/koa'
            },
            {
              text: 'Express',
              link: '/api/express'
            },
            {
              text: 'Socket.io',
              link: '/api/socketio'
            },
            {
              text: 'Channels',
              link: '/api/channels'
            }
          ]
        },
        {
          text: 'Client',
          collapsible: true,
          collapsed: true,
          items: [
            {
              text: 'Feathers Client',
              link: '/api/client'
            },
            {
              text: 'REST Client',
              link: '/api/client/rest'
            },
            {
              text: 'Socket.io Client',
              link: '/api/client/socketio'
            },
            {
              text: 'Authentication',
              link: '/api/authentication/client'
            }
          ]
        },
        {
          text: 'Authentication',
          collapsible: true,
          collapsed: true,
          items: [
            {
              text: 'Overview',
              link: '/api/authentication/'
            },
            {
              text: 'Service',
              link: '/api/authentication/service'
            },
            {
              text: 'Hook',
              link: '/api/authentication/hook'
            },
            {
              text: 'Strategies',
              link: '/api/authentication/strategy'
            },
            {
              text: 'JWT Strategy',
              link: '/api/authentication/jwt'
            },
            {
              text: 'Local Strategy',
              link: '/api/authentication/local'
            },
            {
              text: 'OAuth Strategy',
              link: '/api/authentication/oauth'
            }
          ]
        },
        {
          text: 'Schema',
          collapsible: true,
          collapsed: true,
          items: [
            {
              text: 'Overview',
              link: '/api/schema/'
            },
            {
              text: 'Schemas',
              link: '/api/schema/schema'
            },
            {
              text: 'Resolvers',
              link: '/api/schema/resolvers'
            }
          ]
        },
        {
          text: 'Databases',
          collapsible: true,
          collapsed: true,
          items: [
            {
              text: 'Adapters',
              link: '/api/databases/adapters'
            },
            {
              text: 'Common API',
              link: '/api/databases/common'
            },
            {
              text: 'Querying',
              link: '/api/databases/querying'
            },
            {
              text: 'Adapter - Memory',
              link: '/api/databases/memory'
            },
            {
              text: 'Adapter - MongoDB',
              link: '/api/databases/mongodb'
            },
            {
              text: 'Adapter - Knex',
              link: '/api/databases/knex'
            }
          ]
        }
      ],
      '/help': [
        {
          text: 'Help',
          items: [
            {
              text: 'Getting Help',
              link: '/help/'
            },
            {
              text: 'FAQ',
              link: '/help/faq'
            },
            {
              text: 'Security',
              link: '/guides/security.md'
            }
          ]
        }
      ],
      '/cookbook': [
        {
          text: 'General',
          items: [
            {
              text: 'Scaling',
              link: '/cookbook/general/scaling'
            }
          ]
        },
        {
          text: 'Authentication',
          items: [
            {
              text: 'Anonymous',
              link: '/cookbook/authentication/anonymous'
            },
            {
              text: 'API Key',
              link: '/cookbook/authentication/apiKey'
            },
            {
              text: 'Auth0',
              link: '/cookbook/authentication/auth0'
            },
            {
              text: 'Facebook',
              link: '/cookbook/authentication/facebook'
            },
            {
              text: 'Google',
              link: '/cookbook/authentication/google'
            },
            {
              text: 'Firebase',
              link: '/cookbook/authentication/firebase'
            },
            {
              text: 'Discord',
              link: '/cookbook/authentication/_discord'
            },
            {
              text: 'Stateless JWT',
              link: '/cookbook/authentication/stateless'
            },
            {
              text: 'Revoking JWTs',
              link: '/cookbook/authentication/revoke-jwt'
            }
          ]
        },
        {
          text: 'Express',
          items: [
            {
              text: 'File Uploads',
              link: '/cookbook/express/file-uploading'
            },
            {
              text: 'View Engine SSR',
              link: '/cookbook/express/view-engine'
            }
          ]
        },
        {
          text: 'Deployment',
          items: [
            {
              text: 'Dockerize a Feathers App',
              link: '/cookbook/deploy/docker'
            }
          ]
        }
      ],
      '/comparison': comparisonSidebar,
      '/feathers-vs-firebase': comparisonSidebar,
      '/feathers-vs-meteor': comparisonSidebar,
      '/feathers-vs-sails': comparisonSidebar,
      '/feathers-vs-loopback': comparisonSidebar
    }
  }
})
