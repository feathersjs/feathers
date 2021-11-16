import { HookContext, NextFunction } from '../../../feathers/src/index.ts';
import { createDebug } from '../../../commons/src/index.ts';
import { ConnectionEvent } from '../core.ts';

const debug = createDebug('@feathersjs/authentication/hooks/connection');

export default (event: ConnectionEvent) => async (context: HookContext, next: NextFunction) => {
  await next();

  const { app, result, params } = context;

  if (params.provider && result) {
    debug(`Sending authentication event '${event}'`);
    app.emit(event, result, params, context);
  }
};
