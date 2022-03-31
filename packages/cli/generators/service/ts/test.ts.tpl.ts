import { generator, renderTemplate, toFile } from '@feathershq/pinion'
import { ServiceGeneratorContext } from '../index'

const template = ({ relative, lib, path, name }: ServiceGeneratorContext) =>
`import assert from 'assert'
import { app } from '../${relative}/${lib}/app'

describe('${name} service', () => {
  it('registered the service', () => {
    const service = app.service('${path}')

    assert.ok(service, 'Registered the service')
  })
})
`

export const generate = (ctx: ServiceGeneratorContext) => generator(ctx)
  .then(renderTemplate(template, toFile(({ test, folder, kebabName }: ServiceGeneratorContext) =>
    [test, 'services', ...folder, `${kebabName}.test.ts`]
  )))
