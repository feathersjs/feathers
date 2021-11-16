import { HookContext, NextFunction } from '../../../feathers/src/index.ts';
import { stripSlashes } from '../../../commons/src/index.ts';

export const authentication = () => {
  return (context: HookContext, next: NextFunction) => {
    const { app, params, path, method, app: { authentication: service } } = context;

    if (stripSlashes(service.options.path) === path && method === 'create') {
      return next();
    }

    return Promise.resolve(app.get('authentication')).then(authResult => {
      if (authResult) {
        context.params = Object.assign({}, authResult, params);
      }
    }).then(next);
  };
};
