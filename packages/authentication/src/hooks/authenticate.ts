import flatten from 'lodash/flatten';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import { HookContext } from '@feathersjs/feathers';
import { NotAuthenticated } from '@feathersjs/errors';
import Debug from 'debug';

const debug = Debug('@feathersjs/authentication/hooks/authenticate');

export interface AuthenticateHookSettings {
  service?: string;
  strategies: string[];
}

export default (originalSettings: string | AuthenticateHookSettings, ...originalStrategies: string[]) => {
  const settings = typeof originalSettings === 'string'
    ? { strategies: flatten([ originalSettings, ...originalStrategies ]) }
    : originalSettings;

  if (!originalSettings || settings.strategies.length === 0) {
    throw new Error('The authenticate hook needs at least one allowed strategy');
  }

  return async (context: HookContext) => {
    const { app, params, type, path, service } = context;
    const { strategies, whitelist } = settings;
    const { provider, authentication, query } = params;
    const authService = app.defaultAuthentication(settings.service);

    debug(`Running authenticate hook on '${path}'`);

    if (type && type !== 'before') {
      throw new NotAuthenticated('The authenticate hook must be used as a before hook');
    }

    if (!authService || typeof authService.authenticate !== 'function') {
      throw new NotAuthenticated('Could not find a valid authentication service');
    }

    // @ts-ignore
    if (service === authService) {
      throw new NotAuthenticated('The authenticate hook does not need to be used on the authentication service');
    }

    if (params.authenticated === true) {
      return context;
    }

    if (authentication) {
      const authQuery = pick(query, whitelist);
      const authParams = Object.assign({}, omit(params, 'provider', 'authentication', 'query'), { query: authQuery });

      debug('Authenticating with', authentication, strategies, whitelist);

      const authResult = await authService.authenticate(authentication, authParams, ...strategies);

      context.params = Object.assign({}, params, omit(authResult, 'accessToken'), { authenticated: true });

      return context;
    } else if (provider) {
      throw new NotAuthenticated('Not authenticated');
    }

    return context;
  };
};
