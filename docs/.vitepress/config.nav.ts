import { releases } from './meta'
// import { version } from '../package.json'

const version = 5

export default [
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
        link: 'https://crow.docs.feathersjs.com'
      },
      {
        text: 'Buzzard v3 ',
        link: 'https://buzzard.docs.feathersjs.com'
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
]
