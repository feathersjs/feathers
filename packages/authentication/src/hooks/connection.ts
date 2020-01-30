import { HookContext } from '@feathersjs/feathers';
import { omit } from 'lodash';
import { AuthenticationBase, ConnectionEvent } from '../core';

export default (event: ConnectionEvent) => async (context: HookContext) => {
  const { result, params: { connection } } = context;

  if (!connection) {
    return context;
  }

  const service = context.service as unknown as AuthenticationBase;

  Object.assign(connection, omit(result, 'accessToken', 'authentication'));

  await service.handleConnection(event, connection, result);

  return context;
};
