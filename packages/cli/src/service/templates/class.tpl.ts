import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

const template = ({
  camelName,
  upperName,
  fileName,
  isEntityService,
  authentication
}: ServiceGeneratorContext) =>
  `import { resolveAll } from '@feathersjs/schema'
${isEntityService || authentication ? `import { authenticate } from '@feathersjs/authentication'` : ''}
import type {
  ${upperName}Data,
  ${upperName}Result,
  ${upperName}Query,
} from './${fileName}.schema'
import { ${camelName}Resolvers } from './${fileName}.resolver'

export const ${camelName}Hooks = {
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
`
export const generate = (ctx: ServiceGeneratorContext) =>
  generator(ctx).then(
    renderSource(
      template,
      toFile<ServiceGeneratorContext>(({ lib, folder, fileName }) => [
        lib,
        'services',
        ...folder,
        `${fileName}.class`
      ])
    )
  )
