import { flatten, merge, omit } from 'lodash';
import { HookContext } from '@feathersjs/feathers';
import { NotAuthenticated } from '@feathersjs/errors';
import Debug from 'debug';
import { AuthenticationService } from '../service';
import { AUTHENTICATE } from '../core';

const debug = Debug('@feathersjs/authentication/hooks/authenticate');

export interface AuthenticateHookSettings {
  service?: string;
  strategies: string[];
}

export default (originalSettings: string|AuthenticateHookSettings, ...originalStrategies: string[]) => {
  const settings = typeof originalSettings === 'string'
    ? { strategies: flatten([ originalSettings, ...originalStrategies ]) }
    : originalSettings;

  if (!originalSettings || settings.strategies.length === 0) {
    throw new Error('The authenticate hook needs at least one allowed strategy');
  }

  return async (context: HookContext) => {
    const { app, params, type, path, service } = context;
    const {
      service: authPath = app.get('defaultAuthentication'),
      strategies
    } = settings;
    const { provider, authentication } = params;
    const authService = app.service(authPath) as unknown as AuthenticationService;

    debug(`Running authenticate hook on '${path}'`);

    if (type && type !== 'before') {
      throw new NotAuthenticated('The authenticate hook must be used as a before hook');
    }

    if (!authService || typeof authService.authenticate !== 'function') {
      throw new NotAuthenticated(`Could not find authentication service at '${authPath}'`);
    }

    // @ts-ignore
    if (service === authService) {
      throw new NotAuthenticated('The authenticate hook does not need to be used on the authentication service');
    }

    if (params[AUTHENTICATE] === false) {
      return context;
    }

    if (authentication) {
      const authParams = omit(params, 'provider', 'authentication');

      debug('Authenticating with', authentication, strategies);

      const authResult = await authService.authenticate(authentication, authParams, ...strategies);

      context.params = merge({}, params, omit(authResult, 'accessToken'));

      return context;
    } else if (!authentication && provider) {
      throw new NotAuthenticated('Not authenticated');
    }

    return context;
  };
};
