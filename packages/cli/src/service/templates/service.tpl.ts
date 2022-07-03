import { generator, prepend, toFile, after } from '@feathershq/pinion'
import { injectSource, renderSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

const template = ({ relative, path, className, camelName, fileName }: ServiceGeneratorContext) =>
  `import type { Application } from '${relative}/declarations'

import { ${className}, ${camelName}Hooks } from './${fileName}.class'

// A configure function that registers the service and its hooks via \`app.configure\`
export function ${camelName} (app: Application) {
  const options = { // Service options will go here
  }

  // Register our service on the Feathers application
  app.use('${path}', new ${className}(options), {
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

const importTemplate = ({ camelName, folder, fileName }: ServiceGeneratorContext) =>
  `import { ${camelName} } from './${folder.join('/')}/${fileName}.service'`

const configureTemplate = ({ camelName }: ServiceGeneratorContext) => `  app.configure(${camelName})`

const toServiceIndex = toFile(({ lib }: ServiceGeneratorContext) => [lib, 'services', `index`])

export const generate = (ctx: ServiceGeneratorContext) =>
  generator(ctx)
    .then(
      renderSource(
        template,
        toFile<ServiceGeneratorContext>(({ lib, folder, fileName }) => [
          lib,
          'services',
          ...folder,
          `${fileName}.service`
        ])
      )
    )
    .then(injectSource(importTemplate, prepend(), toServiceIndex))
    .then(injectSource(configureTemplate, after('export const services'), toServiceIndex))
