import { HookContext } from '@feathersjs/feathers';
import { createDebug } from '@feathersjs/commons';
import { ConnectionEvent } from '../core';

const debug = createDebug('@feathersjs/authentication/hooks/connection');

export default (event: ConnectionEvent) => async (context: HookContext) => {
  const { app, result, params } = context;

  if (params.provider && result) {
    debug(`Sending authentication event '${event}'`);
    app.emit(event, result, params, context);
  }

  return context;
};
