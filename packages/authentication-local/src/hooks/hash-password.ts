import get from 'lodash/get';
import set from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';
import { BadRequest } from '@feathersjs/errors';
import Debug from 'debug';
import { HookContext } from '@feathersjs/feathers';
import { LocalStrategy } from '../strategy';

const debug = Debug('@feathersjs/authentication-local/hooks/hash-password');

export interface HashPasswordOptions {
  authentication?: string;
  strategy?: string;
}

export default function hashPassword (field: string, options: HashPasswordOptions = {}) {
  if (!field) {
    throw new Error('The hashPassword hook requires a field name option');
  }

  return async (context: HookContext) => {
    if (context.type !== 'before') {
      throw new Error(`The 'hashPassword' hook should only be used as a 'before' hook`);
    }

    const { app, data, params } = context;

    if (data === undefined) {
      debug(`hook.data is undefined. Skipping hashPassword hook.`);
      return context;
    }

    const authService = app.defaultAuthentication(options.authentication);
    const { strategy = 'local' } = options;

    if (!authService || typeof authService.getStrategies !== 'function') {
      throw new BadRequest(`Could not find an authentication service to hash password`);
    }

    const [ localStrategy ] = authService.getStrategies(strategy) as LocalStrategy[];

    if (!localStrategy || typeof localStrategy.hashPassword !== 'function') {
      throw new BadRequest(`Could not find '${strategy}' strategy to hash password`);
    }

    const addHashedPassword = async (data: any) => {
      const password = get(data, field);

      if (password === undefined) {
        debug(`hook.data.${field} is undefined, not hashing password`);
        return data;
      }

      const hashedPassword: string = await localStrategy.hashPassword(password, params);

      return set(cloneDeep(data), field, hashedPassword);
    }

    context.data = Array.isArray(data) ? await Promise.all(data.map(addHashedPassword)) :
      await addHashedPassword(data);

    return context;
  };
}
