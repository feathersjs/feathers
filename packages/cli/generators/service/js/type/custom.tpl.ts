import { generator, inject, toFile, after } from '@feathershq/pinion'
import { ServiceGeneratorContext } from '../../index'

export const template = ({ className }: ServiceGeneratorContext) =>
`export class ${className} {
  constructor (options) {
    this.options = options || {};
  }

  async find (params) {
    return [];
  }

  async get (id, params) {
    return {
      id, text: \`A new message with id: \${id}!\`
    };
  }

  async create (data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    return data;
  }

  async update (id, data, params) {
    return data;
  }

  async patch (id, data, params) {
    return data;
  }

  async remove (id, params) {
    return { id };
  }
}
`

export const generate = (ctx: ServiceGeneratorContext) => generator(ctx)
  .then(inject(
    template,
    after<ServiceGeneratorContext>(({ className }) => `// The ${className} service class`),
    toFile<ServiceGeneratorContext>(({ lib, folder, kebabName }) =>
      [lib, 'services', ...folder, `${kebabName}.js`]
    )
  ))
