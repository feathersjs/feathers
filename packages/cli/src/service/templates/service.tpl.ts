import { generator, toFile, after, prepend } from '@feathershq/pinion'
import { injectSource, renderSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

export const template = ({
  camelName,
  authentication,
  isEntityService,
  path,
  className,
  relative,
  schema,
  fileName
}: ServiceGeneratorContext) => /* ts */ `
${authentication || isEntityService ? `import { authenticate } from '@feathersjs/authentication'` : ''}
${
  schema
    ? `
import { hooks as schemaHooks } from '@feathersjs/schema'
    
import {
  ${camelName}DataValidator,
  ${camelName}QueryValidator,
  ${camelName}Resolver,
  ${camelName}DataResolver,
  ${camelName}QueryResolver,
  ${camelName}ExternalResolver
} from './${fileName}.schema'
`
    : ''
}

import type { Application } from '${relative}/declarations'
import { ${className}, getOptions } from './${fileName}.class'

export * from './${fileName}.class'
${schema ? `export * from './${fileName}.schema'` : ''}

// A configure function that registers the service and its hooks via \`app.configure\`
export const ${camelName} = (app: Application) => {
  // Register our service on the Feathers application
  app.use('${path}', new ${className}(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: ['find', 'get', 'create', 'update', 'patch', 'remove'],
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service('${path}').hooks({
    around: {
      all: [${
        authentication
          ? `
        authenticate('jwt'),`
          : ''
      }
      ]${
        isEntityService
          ? `,
      find: [ authenticate('jwt') ],
      get: [ authenticate('jwt') ],
      create: [],
      update: [ authenticate('jwt') ],
      patch: [ authenticate('jwt') ],
      remove: [ authenticate('jwt') ]`
          : ''
      }
    },
    before: {
      all: [${
        schema
          ? `
        schemaHooks.validateQuery(${camelName}QueryValidator),
        schemaHooks.validateData(${camelName}DataValidator),
        schemaHooks.resolveQuery(${camelName}QueryResolver),
        schemaHooks.resolveData(${camelName}DataResolver)
      `
          : ''
      }]
    },
    after: {
      all: [${
        schema
          ? `
        schemaHooks.resolveResult(${camelName}Resolver),
        schemaHooks.resolveExternal(${camelName}ExternalResolver)
      `
          : ''
      }]
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '${relative}/declarations' {
  interface ServiceTypes {
    '${path}': ${className}
  }
}
`

const toServiceIndex = toFile(({ lib }: ServiceGeneratorContext) => [lib, 'services', `index`])

export const generate = (ctx: ServiceGeneratorContext) =>
  generator(ctx)
    .then(
      renderSource(
        template,
        toFile(({ lib, fileName, folder }: ServiceGeneratorContext) => [
          lib,
          'services',
          ...folder,
          `${fileName}`
        ])
      )
    )
    .then(
      injectSource<ServiceGeneratorContext>(
        ({ camelName, folder, fileName }) =>
          `import { ${camelName} } from './${folder.join('/')}/${fileName}'`,
        prepend(),
        toServiceIndex
      )
    )
    .then(
      injectSource<ServiceGeneratorContext>(
        ({ camelName }) => `  app.configure(${camelName})`,
        after('export const services'),
        toServiceIndex
      )
    )
