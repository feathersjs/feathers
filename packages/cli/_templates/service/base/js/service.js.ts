import { join } from 'path'
import { VariablesService } from '..'
import { GeneratorContext, RenderResult } from '../../../../src'

export function render (context: GeneratorContext<VariablesService>): RenderResult {
  const to = join(context.h.lib, 'services', `${context.path}.js`)
  const body = `
import { hooks } from '@feathersjs/hooks';
import { resolveData, resolveQuery, resolveResult } from '@feathersjs/schema';

import {
  ${context.camelName}QueryResolver,
  ${context.camelName}DataResolver,
  ${context.camelName}ResultResolver
} from '${context.relative}/schema/${context.path}.schema.js'

// The ${context.className} service class

// Register hooks that run on all service methods
hooks(${context.className}.prototype, [
  resolveQuery(${context.camelName}QueryResolver),
  resolveResult(${context.camelName}ResultResolver)
]);

// Register service method specific hooks
hooks(${context.className}, {
  find: [
  ],
  get: [
  ],
  create: [
    resolveData(${context.camelName}DataResolver)
  ],
  update: [
    resolveData(${context.camelName}DataResolver)
  ],
  patch: [
    resolveData(${context.camelName}DataResolver)
  ],
  remove: [
  ]
});

export { ${context.className} };

// A configure function that registers the service via \`app.configure\`
export function ${context.camelName} (app) {
  const options = {
    paginate: app.get('paginate'),
    app
  }

  app.use('${context.path}', new ${context.className}(options));
}
`

  return { body, to }
}