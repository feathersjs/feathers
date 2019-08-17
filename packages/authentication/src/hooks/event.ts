import Debug from 'debug';
import { HookContext } from '@feathersjs/feathers';

const debug = Debug('@feathersjs/authentication/hooks/connection');

export default (event: string) => (context: HookContext) => {
  const { type, app, result, params } = context;

  if (type === 'after' && params.provider && result) {
    debug(`Sending authentication event '${event}'`);
    app.emit(event, result, params, context);
  }

  return context;
};
