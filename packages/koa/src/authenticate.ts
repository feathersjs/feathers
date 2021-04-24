import Debug from 'debug';
import merge from 'lodash/merge';

import { FeathersKoaContext } from './utils';

const debug = Debug('@feathersjs/koa/authentication');

interface MiddlewareSettings {
  service?: string;
  strategies?: string[];
}

export function parseAuthentication (settings: MiddlewareSettings = {}) {
  return async (ctx: FeathersKoaContext, next: () => Promise<any>) => {
    const { app } = ctx;
    const service = app.defaultAuthentication ? app.defaultAuthentication(settings.service) : null;

    if (service === null) {
      return next();
    }

    const config = service.configuration;
    const authStrategies = settings.strategies || config.parseStrategies || config.authStrategies || [];

    if (authStrategies.length === 0) {
      debug('No `authStrategies` or `parseStrategies` found in authentication configuration');
      return next();
    }

    const req = ctx.request as any;
    const res = ctx.response as any;
    const authentication = await service.parse(req, res, ...authStrategies);

    if (authentication) {
      debug('Parsed authentication from HTTP header', authentication);
      merge(ctx.request, {
        authentication,
        feathers: { authentication }
      });
    }

    return next();
  };
};
