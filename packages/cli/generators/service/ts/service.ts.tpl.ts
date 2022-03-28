import { generator, inject, prepend, renderTemplate, toFile, after } from '@feathershq/pinion'
import { ServiceGeneratorContext } from '../index'

const template = ({ relative, path, className, camelName }: ServiceGeneratorContext) =>
`import { hooks } from '@feathersjs/hooks';
import { resolveData, resolveQuery, resolveResult } from '@feathersjs/schema';

import {
  ${camelName}QueryResolver,
  ${camelName}DataResolver,
  ${camelName}ResultResolver
} from '${relative}/schema/${path}.schema.ts'

// The ${className} service class

export const hooks = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [processMessage()],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [populateUser()],
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

// Register hooks that run on all service methods
hooks(${className}.prototype, [
  resolveQuery(${camelName}QueryResolver),
  resolveResult(${camelName}ResultResolver)
]);

// Register service method specific hooks
hooks(${className}, {
  find: [
  ],
  get: [
  ],
  create: [
    resolveData(${camelName}DataResolver)
  ],
  update: [
    resolveData(${camelName}DataResolver)
  ],
  patch: [
    resolveData(${camelName}DataResolver)
  ],
  remove: [
  ]
});

export { ${className} };

// A configure function that registers the service via \`app.configure\`
export function ${camelName} (app) {
  const options = {
    paginate: app.get('paginate'),
    app
  }

  app.use('${path}', new ${className}(options));
  app.service().hooks(hooks)
}
`

const importTemplate = ({ camelName, path } : ServiceGeneratorContext) =>
`import { ${camelName} } from './${path}.ts';`

const configureTemplate = ({ camelName } : ServiceGeneratorContext) =>
`  app.configure(${camelName});
`

const toServiceIndex = toFile(({ lib } : ServiceGeneratorContext) => [ lib, 'services/index.ts' ])

export const generate = (ctx: ServiceGeneratorContext) => generator(ctx)
  .then(renderTemplate(template, toFile<ServiceGeneratorContext>(({ lib, folder, kebabName }) =>
    [lib, 'services', ...folder, `${kebabName}.ts`]
  )))
  .then(inject(importTemplate, prepend(), toServiceIndex))
  .then(inject(configureTemplate, after('export default'), toServiceIndex))
