import { generator, inject, prepend, renderTemplate, toFile, after } from '@feathershq/pinion'
import { ServiceGeneratorContext } from '../index'

const template = ({ relative, path, className, camelName, upperName }: ServiceGeneratorContext) =>
`import { resolveData, resolveQuery, resolveResult } from '@feathersjs/schema'
import { Application } from '${relative}/declarations'

import {
  ${upperName}Data,
  ${upperName}Result,
  ${camelName}QueryResolver,
  ${camelName}DataResolver,
  ${camelName}PatchResolver,
  ${camelName}ResultResolver
} from '${relative}/schemas/${path}.schema.js'

// The ${className} service class

export const serviceHooks = [
  resolveResult(${camelName}ResultResolver),
  resolveQuery(${camelName}QueryResolver)
]

export const methodHooks = {
  find: [],
  get: [],
  create: [
    resolveData(${camelName}DataResolver)
  ],
  update: [
    resolveData(${camelName}DataResolver)
  ],
  patch: [
    resolveData(${camelName}PatchResolver)
  ],
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

  app.use('${path}', new ${className}(options))
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

const importTemplate = ({ camelName, path } : ServiceGeneratorContext) =>
`import { ${camelName} } from './${path}'`

const configureTemplate = ({ camelName } : ServiceGeneratorContext) =>
`  app.configure(${camelName})`

const toServiceIndex = toFile(({ lib } : ServiceGeneratorContext) => [ lib, 'services/index.ts' ])

export const generate = (ctx: ServiceGeneratorContext) => generator(ctx)
  .then(renderTemplate(template, toFile<ServiceGeneratorContext>(({ lib, folder, kebabName }) =>
    [lib, 'services', ...folder, `${kebabName}.ts`]
  )))
  .then(inject(importTemplate, prepend(), toServiceIndex))
  .then(inject(configureTemplate, after('export default'), toServiceIndex))
