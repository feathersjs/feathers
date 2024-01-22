import { toFile } from '@featherscloud/pinion'
import { renderSource } from '../../commons.js'
import { ServiceGeneratorContext } from '../index.js'

const template = ({
  relative,
  lib,
  path
}: ServiceGeneratorContext) => /* ts */ `// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from 'assert'
import { app } from '../${relative}/${lib}/app'

describe('${path} service', () => {
  it('registered the service', () => {
    const service = app.service('${path}')

    assert.ok(service, 'Registered the service')
  })
})
`

export const generate = (ctx: ServiceGeneratorContext) =>
  Promise.resolve(ctx).then(
    renderSource(
      template,
      toFile<ServiceGeneratorContext>(({ test, folder, fileName }) => [
        test,
        'services',
        ...folder,
        `${fileName}.test`
      ])
    )
  )
