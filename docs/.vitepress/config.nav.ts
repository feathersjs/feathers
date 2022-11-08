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
    text: 'Ecosystem',
    link: '/ecosystem/'
  }
]
