import { HookContext, NextFunction } from '@feathersjs/feathers';
import omit from 'lodash/omit';
import { AuthenticationBase, ConnectionEvent } from '../core';

export default (event: ConnectionEvent) => async (context: HookContext, next: NextFunction) => {
  await next();

  const { result, params: { connection } } = context;

  if (connection) {
    const service = context.service as unknown as AuthenticationBase;

    Object.assign(connection, omit(result, 'accessToken', 'authentication'));

    await service.handleConnection(event, connection, result);
  }
};
