import { HookContext } from '@feathersjs/feathers';
import { omit } from 'lodash';

import { AuthenticationBase } from '../core';

export default () => async (context: HookContext) => {
  const { result, params: { connection } } = context;

  if (!connection) {
    return context;
  }

  const service = context.service as unknown as AuthenticationBase;
  const strategies = service.getStrategies(...Object.keys(service.strategies))
    .filter(current => typeof current.handleConnection === 'function');

  Object.assign(connection, omit(result, 'accessToken', 'authentication'));

  for (const strategy of strategies) {
    await strategy.handleConnection(connection, context);
  }

  return context;
};
