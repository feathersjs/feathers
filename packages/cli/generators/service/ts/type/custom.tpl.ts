import { generator, inject, toFile, after, prepend } from '@feathershq/pinion'
import { ServiceGeneratorContext } from '../../index'

export const template = ({ className, upperName }: ServiceGeneratorContext) =>
`export interface ${className}Options {
  app: Application
}

export class ${className} implements ServiceInterface<${upperName}Result, ${upperName}Data> {
  constructor (public options: ${className}Options) {
  }

  async find (params?: Params) {
    return [];
  }

  async get (id: Id, params?: Params) {
    return {
      id, text: \`A new message with ID: \${id}!\`
    };
  }

  async create (data: Data, params?: Params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    return data;
  }

  async update (id: NullableId, data: Data, params?: Params) {
    return data;
  }

  async patch (id: NullableId, data: Data, params?: Params) {
    return data;
  }

  async remove (id: NullableId, params?: Params) {
    return { id };
  }
}
`

export const importTemplate = 'import { Id, NullableId, Params, ServiceMethods } from \'@feathersjs/feathers\''

const toServiceFile = toFile<ServiceGeneratorContext>(({ lib, folder, kebabName }) =>
  [lib, 'services', ...folder, `${kebabName}.ts`]
)

export const generate = (ctx: ServiceGeneratorContext) => generator(ctx)
  .then(inject(
    template,
    after<ServiceGeneratorContext>(({ className }) => `// The ${className} service class`),
    toServiceFile
  ))
  .then(inject(importTemplate, prepend(), toServiceFile))
