import { generator, prepend, after, toFile } from '@feathershq/pinion'
import { injectSource } from '../commons'
import { ServiceGeneratorContext } from './index'

const toServiceIndex = toFile(({ lib }: ServiceGeneratorContext) => [lib, 'services', `index`])

export const registerService = (ctx: ServiceGeneratorContext) =>
  generator(ctx)
    .then(
      injectSource<ServiceGeneratorContext>(
        ({ camelName, folder, fileName }) =>
          `import { ${camelName} } from './${folder.join('/')}/${fileName}.service'`,
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

export const serviceImportTemplate = ({
  authentication,
  isEntityService,
  camelName,
  upperName,
  fileName,
  relative,
  schema
}: ServiceGeneratorContext) => `
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

import type {
  ${upperName},
  ${upperName}Data,
  ${upperName}Query
} from './${fileName}.schema'

export * from './${fileName}.schema'
`
    : `
export type ${upperName} = any
export type ${upperName}Data = any
export type ${upperName}Query = any
`
}

import type { Application } from '${relative}/declarations'
`

export const serviceRegistrationTemplate = ({
  camelName,
  authentication,
  isEntityService,
  path,
  className,
  relative,
  schema
}: ServiceGeneratorContext) => /* ts */ `
export const ${camelName}Hooks = {
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
}

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
  app.service('${path}').hooks(${camelName}Hooks)
}

// Add this service to the service type index
declare module '${relative}/declarations' {
  interface ServiceTypes {
    '${path}': ${className}
  }
}
`
