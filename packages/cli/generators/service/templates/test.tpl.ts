import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

const js = ({ relative, lib, path, name }: ServiceGeneratorContext) =>
`import assert from 'assert'
import { app } from '../${relative}/${lib}/app.js'

describe('${name} service', () => {
  it('registered the service', () => {
    const service = app.service('${path}')

    assert.ok(service, 'Registered the service')
  })
})
`

const ts = ({ relative, lib, path, name }: ServiceGeneratorContext) =>
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
  .then(renderSource({ js, ts }, toFile<ServiceGeneratorContext>(({ test, folder, kebabName }) =>
    [test, 'services', ...folder, `${kebabName}.test`]
  )))
