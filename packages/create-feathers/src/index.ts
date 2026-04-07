import { sep, dirname } from 'path'
import { prompt, runGenerators, when } from '@featherscloud/pinion'
import { fileURLToPath } from 'url'

import type { AppGeneratorArguments, AppGeneratorContext } from './commons.js'
import { initializeBaseContext, install } from './commons.js'

export { getContext } from '@featherscloud/pinion'

// Set __dirname in es module
const __dirname = dirname(fileURLToPath(import.meta.url))

export const generate = (ctx: AppGeneratorArguments) =>
  Promise.resolve(ctx)
    .then(initializeBaseContext())
    .then((ctx) => ({
      ...ctx,
      dependencies: [] as string[],
      devDependencies: [] as string[]
    }))
    .then(
      prompt((ctx) => [
        {
          name: 'name',
          type: 'input',
          when: !ctx.name,
          message: 'What is the name of your application?',
          default: ctx.cwd.split(sep).pop(),
          validate: (input) => {
            if (ctx.dependencyVersions[input]) {
              return `Application can not have the same name as a dependency`
            }

            return true
          }
        },
        {
          name: 'description',
          type: 'input',
          when: !ctx.description,
          message: 'Write a short description'
        },
        {
          name: 'platform',
          type: 'list',
          when: !ctx.platform,
          message: 'Which platform do you want to use?',
          choices: [
            { value: 'node', name: 'Node' },
            { value: 'deno', name: 'Deno' },
            { value: 'bun', name: 'Bun' }
          ]
        },
        {
          name: 'packager',
          type: 'list',
          when: ({ platform }) => platform === 'node' && !ctx.packager,
          message: 'Which package manager are you using?',
          choices: [
            { value: 'npm', name: 'npm' },
            { value: 'yarn', name: 'Yarn' },
            { value: 'pnpm', name: 'pnpm' }
          ]
        },
        {
          name: 'sse',
          type: 'confirm',
          when: ctx.sse === undefined,
          message: 'Enable real-time events?',
          default: true
        }
      ])
    )
    .then(runGenerators(__dirname, 'templates'))
    .then(initializeBaseContext())
    .then(
      install(
        (ctx) => [ctx.platform === 'deno' ? 'npm:feathers@pre' : 'feathers@pre'],
        false,
        (ctx): string => {
          if (ctx.packager) {
            return ctx.packager
          }

          if (ctx.platform === 'deno' || ctx.platform === 'bun') {
            return ctx.platform
          }

          return 'npm'
        }
      )
    )
    .then(
      when(
        (ctx) => (ctx as AppGeneratorContext).platform === 'node',
        install(['tsx'], true, (ctx) => (ctx as AppGeneratorContext).packager)
      )
    )
