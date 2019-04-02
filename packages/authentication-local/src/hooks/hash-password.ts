import { get, set, cloneDeep } from 'lodash';
import { BadRequest } from '@feathersjs/errors';
import Debug from 'debug';
import { HookContext } from '@feathersjs/feathers';

const debug = Debug('@feathersjs/authentication-local/hooks/hash-password');

export interface HashPasswordOptions {
  authentication?: string;
  strategy?: string;
}

export default function hashPassword(field: string, options: HashPasswordOptions = {}) {
  if (!field) {
    throw new Error('The hashPassword hook requires a field name option');
  }

  return async (context: HookContext) => {
    if (context.type !== 'before') {
      throw new Error(`The 'hashPassword' hook should only be used as a 'before' hook`);
    }

    const { app, data, params } = context;
    const password = get(data, field);

    if (data === undefined || password === undefined) {
      debug(`hook.data or hook.data.${field} is undefined. Skipping hashPassword hook.`);
      return context;
    }

    const serviceName = options.authentication || app.get('defaultAuthentication');
    const authService = app.service(serviceName);
    const { strategy = 'local' } = options;

    if (!authService || typeof authService.getStrategies !== 'function') {
      throw new BadRequest(`Could not find '${serviceName}' service to hash password`);
    }

    const [ localStrategy ] = authService.getStrategies(strategy);

    if (!localStrategy || typeof localStrategy.hashPassword !== 'function') {
      throw new BadRequest(`Could not find '${strategy}' strategy to hash password`);
    }

    const hashedPassword: string = await localStrategy.hashPassword(password, params);
    
    context.data = set(cloneDeep(data), field, hashedPassword);

    return context;
  };
}
