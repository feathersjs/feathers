import { generator, inject, prepend, toFile, after } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

const template = ({ relative, path, className, camelName, upperName }: ServiceGeneratorContext) =>
  `import { resolveAll } from '@feathersjs/schema'
import { Application } from '${relative}/declarations'

import {
  ${upperName}Data,
  ${upperName}Result,
  ${upperName}Query,
  ${camelName}Resolvers
} from '${relative}/schemas/${path}.schema'

// The ${className} service class

export const serviceHooks = [
  resolveAll(${camelName}Resolvers)
]

export const methodHooks = {
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
}

export const regularHooks = {
  before: {},
  after: {},
  error: {}
}

// A configure function that registers the service and its hooks via \`app.configure\`
export function ${camelName} (app: Application) {
  const options = {
    paginate: app.get('paginate'),
    app
  }

  // Register our service on the Feathers application
  app.use('${path}', new ${className}(options), {
    // A list of all methods this service exposes externally
    methods: ['find', 'get', 'create', 'update', 'patch', 'remove'],
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service('${path}').hooks(serviceHooks)
  app.service('${path}').hooks(methodHooks)
  app.service('${path}').hooks(regularHooks)
}

// Add this service to the service type index
declare module '${relative}/declarations' {
  interface ServiceTypes {
    '${path}': ${className}
  }
}
`

const importTemplate = ({ camelName, path }: ServiceGeneratorContext) => `import { ${camelName} } from './${path}'`

const configureTemplate = ({ camelName }: ServiceGeneratorContext) => `  app.configure(${camelName})`

const toServiceIndex = toFile(({ lib, language }: ServiceGeneratorContext) => [lib, 'services', `index.${language}`])

export const generate = (ctx: ServiceGeneratorContext) =>
  generator(ctx)
    .then(
      renderSource(
        template,
        toFile<ServiceGeneratorContext>(({ lib, folder, kebabName }) => [lib, 'services', ...folder, kebabName])
      )
    )
    .then(inject(importTemplate, prepend(), toServiceIndex))
    .then(inject(configureTemplate, after('export const services'), toServiceIndex))
