import { join } from 'path'
import { VariablesService } from '..'
import { GeneratorContext, RenderResult } from '../../../../src'

export function render (context: GeneratorContext<VariablesService>): RenderResult {
  const to = join(context.h.lib, 'services', `${context.path}.ts`)
  const body = `
import { hooks } from '@feathersjs/hooks';


// The ${context.className} service class

// Register hooks that run on all service methods
hooks(${context.className}.prototype, [
]);

// Register service method specific hooks
hooks(${context.className}, {
  find: [
  ],
  get: [
  ],
  create: [
  ],
  update: [
  ],
  patch: [
  ],
  remove: [
  ]
});

export { ${context.className} };

// Add this service to the service type index
declare module '${context.relative}/declarations' {
  interface ServiceTypes {
    '${context.path}': ${context.className};
  }
}

// A configure function that registers the service via \`app.configure\`
export function ${context.camelName} (app: Application) {
  const options = {
    paginate: app.get('paginate'),
    app
  }

  app.use('${context.path}', new ${context.className}(options));
}
`

  return { body, to }
}