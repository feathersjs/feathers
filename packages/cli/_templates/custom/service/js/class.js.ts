import { join } from 'path'
import { GeneratorContext, RenderResult } from '../../../../src'
import { VariablesService } from '../../../service/base'

export function render (context: GeneratorContext<VariablesService>): RenderResult {
  const to = join(context.h.lib, 'services', `${context.path}.js`)
  const body = `
class ${context.className} {
  constructor (options) {
    this.options = options || {};
  }

  async find (params) {
    return [];
  }

  async get (id, params) {
    return {
      id, text: \`A new message with ID: \${id}!\`
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

  return { 
    body, 
    to,
    inject: true,
    after: `The ${context.className} service class`
  }
}