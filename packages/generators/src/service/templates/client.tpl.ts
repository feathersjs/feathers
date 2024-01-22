import { toFile, after, before, when } from '@featherscloud/pinion'
import { fileExists, injectSource } from '../../commons.js'
import { ServiceGeneratorContext } from '../index.js'

const importTemplate = ({ upperName, folder, fileName, camelName }: ServiceGeneratorContext) => /* ts */ `
import { ${camelName}Client } from './services/${folder.join('/')}/${fileName}.shared'
export type {
  ${upperName},
  ${upperName}Data,
  ${upperName}Query,
  ${upperName}Patch
} from './services/${folder.join('/')}/${fileName}.shared'
`

const registrationTemplate = ({ camelName }: ServiceGeneratorContext) =>
  `  client.configure(${camelName}Client)`

const toClientFile = toFile<ServiceGeneratorContext>(({ lib }) => [lib, 'client'])

export const generate = async (ctx: ServiceGeneratorContext) =>
  Promise.resolve(ctx).then(
    when<ServiceGeneratorContext>(
      ({ lib, language }) => fileExists(lib, `client.${language}`),
      injectSource(registrationTemplate, before('return client'), toClientFile),
      injectSource(
        importTemplate,
        after<ServiceGeneratorContext>(({ language }) =>
          language === 'ts' ? 'import type { AuthenticationClientOptions }' : 'import authenticationClient'
        ),
        toClientFile
      )
    )
  )
