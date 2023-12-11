import { generator, toFile, when } from '@feathershq/pinion'
import { fileExists, renderSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

const sharedTemplate = ({
  camelName,
  upperName,
  className,
  fileName,
  relative,
  path
}: ServiceGeneratorContext) => /* ts */ `// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '${relative}/client'
import type {
  ${upperName},
  ${upperName}Data,
  ${upperName}Patch,
  ${upperName}Query,
  ${className}
} from './${fileName}.class'

export type { ${upperName}, ${upperName}Data, ${upperName}Patch, ${upperName}Query }

export type ${upperName}ClientService = Pick<
  ${className}<Params<${upperName}Query>>,
  typeof ${camelName}Methods[number]
>

export const ${camelName}Path = '${path}'

export const ${camelName}Methods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const ${camelName}Client = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(${camelName}Path, connection.service(${camelName}Path), {
    methods: ${camelName}Methods
  })
}

// Add this service to the client service type index
declare module '${relative}/client' {
  interface ServiceTypes {
    [${camelName}Path]: ${upperName}ClientService
  }
}
`

export const generate = async (ctx: ServiceGeneratorContext) =>
  generator(ctx).then(
    when<ServiceGeneratorContext>(
      ({ lib, language }) => fileExists(lib, `client.${language}`),
      renderSource(
        sharedTemplate,
        toFile(({ lib, folder, fileName }: ServiceGeneratorContext) => [
          lib,
          'services',
          ...folder,
          `${fileName}.shared`
        ])
      )
    )
  )
