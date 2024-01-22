import { toFile, when, writeJSON } from '@featherscloud/pinion'
import { renderSource } from '../../commons.js'
import { AppGeneratorContext } from '../index.js'

const defaultConfig = ({}: AppGeneratorContext) => ({
  host: 'localhost',
  port: 3030,
  public: './public/',
  origins: ['http://localhost:3030'],
  paginate: {
    default: 10,
    max: 50
  }
})

const customEnvironment = {
  port: {
    __name: 'PORT',
    __format: 'number'
  },
  host: 'HOSTNAME',
  authentication: {
    secret: 'FEATHERS_SECRET'
  }
}

const testConfig = {
  port: 8998
}

const configurationJsonTemplate =
  ({}: AppGeneratorContext) => `import { defaultAppSettings, getValidator } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'

import { dataValidator } from './validators'

export const configurationSchema = {
  $id: 'configuration',
  type: 'object',
  additionalProperties: false,
  required: [ 'host', 'port', 'public' ],
  properties: {
    ...defaultAppSettings,
    host: { type: 'string' },
    port: { type: 'number' },
    public: { type: 'string' }
  }
} as const

export const configurationValidator = getValidator(configurationSchema, dataValidator)

export type ApplicationConfiguration = FromSchema<typeof configurationSchema>
`

const configurationTypeboxTemplate =
  ({}: AppGeneratorContext) => `import { Type, getValidator, defaultAppConfiguration } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import { dataValidator } from './validators'

export const configurationSchema = Type.Intersect([
  defaultAppConfiguration,
  Type.Object({
    host: Type.String(),
    port: Type.Number(),
    public: Type.String()
  })
])

export type ApplicationConfiguration = Static<typeof configurationSchema>

export const configurationValidator = getValidator(configurationSchema, dataValidator)
`

export const generate = (ctx: AppGeneratorContext) =>
  Promise.resolve(ctx)
    .then(writeJSON(defaultConfig, toFile('config', 'default.json')))
    .then(writeJSON(testConfig, toFile('config', 'test.json')))
    .then(writeJSON(customEnvironment, toFile('config', 'custom-environment-variables.json')))
    .then(
      when<AppGeneratorContext>(
        (ctx) => ctx.schema !== false,
        renderSource(
          async (ctx) =>
            ctx.schema === 'typebox' ? configurationTypeboxTemplate(ctx) : configurationJsonTemplate(ctx),
          toFile<AppGeneratorContext>(({ lib }) => lib, 'configuration')
        )
      )
    )
