import { generator, toFile, before, mergeJSON } from '@feathershq/pinion'
import { ConnectionGeneratorContext } from '../index'
import { injectSource, renderSource } from '../../commons'
import { mkdir } from 'fs/promises'
import path from 'path'

const template = ({
  database
}: ConnectionGeneratorContext) => /* ts */ `// For more information about this file see https://dove.feathersjs.com/guides/cli/databases.html
import knex from 'knex'
import type { Knex } from 'knex'
import type { Application } from './declarations'

declare module './declarations' {
  interface Configuration {
    ${database}Client: Knex
  }
}

export const ${database} = (app: Application) => {
  const config = app.get('${database}')
  const db = knex(config!)

  app.set('${database}Client', db)
}
`

const knexfile = ({
  lib,
  language,
  database
}: ConnectionGeneratorContext) => /* ts */ `// For more information about this file see https://dove.feathersjs.com/guides/cli/databases.html
import { app } from './${lib}/app'

// Load our database connection info from the app configuration
const config = app.get('${database}')

${language === 'js' ? 'export default config' : 'module.exports = config'}
`

const importTemplate = ({ database }: ConnectionGeneratorContext) =>
  `import { ${database} } from './${database}'`
const configureTemplate = ({ database }: ConnectionGeneratorContext) => `app.configure(${database})`

const toAppFile = toFile<ConnectionGeneratorContext>(({ lib }) => [lib, 'app'])

export const generate = (ctx: ConnectionGeneratorContext) =>
  generator(ctx)
    .then(
      renderSource(
        template,
        toFile<ConnectionGeneratorContext>(({ lib, database }) => [lib, database])
      )
    )
    .then(renderSource(knexfile, toFile('knexfile')))
    .then(
      mergeJSON<ConnectionGeneratorContext>(
        {
          scripts: {
            migrate: 'knex migrate:latest',
            'migrate:make': 'knex migrate:make',
            test: 'cross-env NODE_ENV=test npm run migrate && npm run mocha'
          }
        },
        toFile('package.json')
      )
    )
    .then(injectSource(importTemplate, before('import { services } from'), toAppFile))
    .then(injectSource(configureTemplate, before('app.configure(services)'), toAppFile))
    .then(async (ctx) => {
      await mkdir(path.join(ctx.cwd, 'migrations'))
      return ctx
    })
