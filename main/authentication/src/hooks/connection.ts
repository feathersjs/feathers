import { omit } from 'https://deno.land/x/lodash@4.17.19/lodash.js';
import { HookContext, NextFunction } from '../../../feathers/src/index.ts';
import { AuthenticationBase, ConnectionEvent } from '../core.ts';

export default (event: ConnectionEvent) => async (context: HookContext, next: NextFunction) => {
  await next();

  const { result, params: { connection } } = context;

  if (connection) {
    const service = context.service as unknown as AuthenticationBase;

    Object.assign(connection, omit(result, 'accessToken', 'authentication'));

    await service.handleConnection(event, connection, result);
  }
};
