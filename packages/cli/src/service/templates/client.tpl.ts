import { generator, toFile, when, after, before } from '@feathershq/pinion'
import { injectSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

const importTemplate = ({
  upperName,
  folder,
  fileName,
  className
}: ServiceGeneratorContext) => /* ts */ `import type {
  ${upperName},
  ${upperName}Data,
  ${upperName}Query,
  ${className}
} from './services/${folder.join('/')}/${fileName}'
export type {
  ${upperName},
  ${upperName}Data,
  ${upperName}Query
}
`

const methodsTemplate = ({ camelName }: ServiceGeneratorContext) =>
  `const ${camelName}ServiceMethods = ['find', 'get', 'create', 'update', 'patch', 'remove'] as const`

const declarationTemplate = ({ path, className, camelName }: ServiceGeneratorContext) =>
  `  '${path}': Pick<${className}, typeof ${camelName}ServiceMethods[number]>`

const registrationTemplate = ({
  camelName,
  path
}: ServiceGeneratorContext) => `  client.use('${path}', connection.service('${path}'), {
  methods: ${camelName}ServiceMethods
})`

const toClientFile = toFile<ServiceGeneratorContext>(({ lib }) => [lib, 'client'])

export const generate = async (ctx: ServiceGeneratorContext) =>
  generator(ctx)
    .then(
      injectSource(
        registrationTemplate,
        before('return client'),
        toFile<ServiceGeneratorContext>(({ lib }) => [lib, 'client'])
      )
    )
    .then(
      when(
        (ctx) => ctx.language === 'js',
        injectSource(methodsTemplate, before('\nexport const createClient'), toClientFile)
      )
    )
    .then(
      when(
        (ctx) => ctx.language === 'ts',
        injectSource(methodsTemplate, before('\nexport interface ServiceTypes'), toClientFile),
        injectSource(importTemplate, after("from '@feathersjs/feathers'"), toClientFile),
        injectSource(declarationTemplate, after('export interface ServiceTypes'), toClientFile)
      )
    )
