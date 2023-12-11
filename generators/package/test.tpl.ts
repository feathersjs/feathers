import { generator, renderTemplate, toFile } from '@feathershq/pinion'
import { ModuleContext } from '../package'

interface Context extends ModuleContext {}

const template = ({ moduleName, name }: Context) => /** ts */ `import { strict as assert } from 'assert'
import { ${name} } from '../src/index'

describe('${moduleName}', () => {
  it('initializes', () => {
    assert.equal(${name}(), 'Hello from ${name}')
  })
})
`

export const generate = (context: Context) =>
  generator(context).then(
    renderTemplate(template, toFile<Context>(context.packagePath, 'test', 'index.test.ts'))
  )
