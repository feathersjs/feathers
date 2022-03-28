import { generator, inject, prepend, renderTemplate, toFile, after } from '@feathershq/pinion'
import { ServiceGeneratorContext } from '../index'

const template = ({ relative, path, className, camelName }: ServiceGeneratorContext) =>
`import { resolveData, resolveQuery, resolveResult } from '@feathersjs/schema';

import {
  ${camelName}QueryResolver,
  ${camelName}DataResolver,
  ${camelName}PatchResolver,
  ${camelName}ResultResolver
} from '${relative}/schemas/${path}.schema.js'

// The ${className} service class

export const hooks = {
  before: {
    all: [
      resolveQuery(${camelName}QueryResolver)
    ],
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
  },

  after: {
    all: [
      resolveResult(${camelName}ResultResolver)
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};

// A configure function that registers the service via \`app.configure\`
export function ${camelName} (app) {
  const options = {
    paginate: app.get('paginate'),
    app
  }

  app.use('${path}', new ${className}(options));
  app.service('${path}').hooks(hooks)
}
`

const importTemplate = ({ camelName, path } : ServiceGeneratorContext) =>
`import { ${camelName} } from './${path}.js';`

const configureTemplate = ({ camelName } : ServiceGeneratorContext) =>
`  app.configure(${camelName});`

const toServiceIndex = toFile(({ lib } : ServiceGeneratorContext) => [ lib, 'services/index.js' ])

export const generate = (ctx: ServiceGeneratorContext) => generator(ctx)
  .then(renderTemplate(template, toFile<ServiceGeneratorContext>(({ lib, folder, kebabName }) =>
    [lib, 'services', ...folder, `${kebabName}.js`]
  )))
  .then(inject(importTemplate, prepend(), toServiceIndex))
  .then(inject(configureTemplate, after('export default'), toServiceIndex))
