import { generator, inject, prepend, toFile, after } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

const template = ({
  relative,
  path,
  folder,
  kebabName,
  className,
  camelName,
  upperName,
  isEntityService,
  authentication
}: ServiceGeneratorContext) =>
  `import { resolveAll } from '@feathersjs/schema'
${isEntityService || authentication ? `import { authenticate } from '@feathersjs/authentication'` : ''}
import { Application } from '${relative}/declarations'

import {
  ${upperName}Data,
  ${upperName}Result,
  ${upperName}Query,
  ${camelName}Resolvers
} from '${relative}/schemas/${folder.join('/')}/${kebabName}.schema'

export const hooks = {
  around: {
    all: [${
      authentication
        ? `
      authenticate('jwt'),`
        : ''
    } ${
    !isEntityService
      ? `
      resolveAll(${camelName}Resolvers)`
      : ''
  }
    ]${
      isEntityService
        ? `,
    get: [
      authenticate('jwt'),
      resolveAll(${camelName}Resolvers)
    ],
    find: [
      authenticate('jwt'),
      resolveAll(${camelName}Resolvers)
    ],
    create: [
      resolveAll(${camelName}Resolvers)
    ],
    patch: [
      authenticate('jwt'),
      resolveAll(${camelName}Resolvers)
    ],
    update: [
      authenticate('jwt'),
      resolveAll(${camelName}Resolvers)
    ],
    remove: [
      authenticate('jwt'),
      resolveAll(${camelName}Resolvers)
    ]`
        : ''
    }
  },
  before: {},
  after: {},
  error: {}
}

// A configure function that registers the service and its hooks via \`app.configure\`
export function ${camelName} (app: Application) {
  const options = {
  }

  // Register our service on the Feathers application
  app.use('${path}', new ${className}(options), {
    // A list of all methods this service exposes externally
    methods: ['find', 'get', 'create', 'update', 'patch', 'remove'],
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service('${path}').hooks(hooks)
}

// Add this service to the service type index
declare module '${relative}/declarations' {
  interface ServiceTypes {
    '${path}': ${className}
  }
}
`

const importTemplate = ({ camelName, path }: ServiceGeneratorContext) =>
  `import { ${camelName} } from './${path}'`

const configureTemplate = ({ camelName }: ServiceGeneratorContext) => `  app.configure(${camelName})`

const toServiceIndex = toFile(({ lib, language }: ServiceGeneratorContext) => [
  lib,
  'services',
  `index.${language}`
])

export const generate = (ctx: ServiceGeneratorContext) =>
  generator(ctx)
    .then(
      renderSource(
        template,
        toFile<ServiceGeneratorContext>(({ lib, folder, kebabName }) => [
          lib,
          'services',
          ...folder,
          kebabName
        ])
      )
    )
    .then(inject(importTemplate, prepend(), toServiceIndex))
    .then(inject(configureTemplate, after('export const services'), toServiceIndex))
