import { releases } from './meta'
// import { version } from '../package.json'

const version = '6-compat'

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
        text: 'v6',
        link: 'https://feathersjs.com'
      },
      {
        text: 'Eagle (v6-compat)',
        link: 'https://eagle.feathersjs.com'
      },
      {
        text: 'Dove (v5)',
        link: 'https://dove.feathersjs.com'
      },
      {
        text: 'Crow (v4)',
        link: 'https://crow.docs.feathersjs.com'
      }
    ]
  },
  {
    text: 'Ecosystem',
    link: '/ecosystem/'
  }
]
