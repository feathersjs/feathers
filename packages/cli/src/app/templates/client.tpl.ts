import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { AppGeneratorContext } from '../index'

const template = ({}: AppGeneratorContext) => /* ts */ `import { feathers } from '@feathersjs/feathers'
import type { TransportConnection, Params } from '@feathersjs/feathers'

export interface ServiceTypes {
  //
}

export const createClient = <Configuration = any> (connection: TransportConnection<ServiceTypes>) => {
  const client = feathers<ServiceTypes, Configuration>()

  client.configure(connection)

  return client
}
`

export const generate = async (ctx: AppGeneratorContext) =>
  generator(ctx).then(
    renderSource(
      template,
      toFile<AppGeneratorContext>(({ lib }) => lib, 'client')
    )
  )
