import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { prompt, runGenerators } from '@featherscloud/pinion'
import _ from 'lodash'
import { checkPreconditions, FeathersBaseContext, initializeBaseContext } from '../commons.js'

// Set __dirname in es module
const __dirname = dirname(fileURLToPath(import.meta.url))

export interface HookGeneratorContext extends FeathersBaseContext {
  name: string
  camelName: string
  kebabName: string
  type: 'regular' | 'around'
}

export const generate = (ctx: HookGeneratorContext) =>
  Promise.resolve(ctx)
    .then(initializeBaseContext())
    .then(checkPreconditions())
    .then(
      prompt<HookGeneratorContext>(({ type, name }) => [
        {
          type: 'input',
          name: 'name',
          message: 'What is the name of the hook?',
          when: !name
        },
        {
          name: 'type',
          type: 'list',
          when: !type,
          message: 'What kind of hook is it?',
          choices: [
            { value: 'around', name: 'Around' },
            { value: 'regular', name: 'Before, After or Error' }
          ]
        }
      ])
    )
    .then((ctx) => {
      const { name } = ctx
      const kebabName = _.kebabCase(name)
      const camelName = _.camelCase(name)

      return {
        ...ctx,
        kebabName,
        camelName
      }
    })
    .then(runGenerators(__dirname, 'templates'))
