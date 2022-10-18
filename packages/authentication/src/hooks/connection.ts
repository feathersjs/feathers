import { HookContext, NextFunction } from '@feathersjs/feathers'
import { AuthenticationBase, ConnectionEvent } from '../core'

export default (event: ConnectionEvent) => async (context: HookContext, next: NextFunction) => {
  await next()

  const {
    result,
    params: { connection }
  } = context

  if (connection) {
    const service = context.service as unknown as AuthenticationBase

    await service.handleConnection(event, connection, result)
  }
}
