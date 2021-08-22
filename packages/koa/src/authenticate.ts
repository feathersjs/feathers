import { Next } from 'koa';
import { createDebug } from '@feathersjs/commons';

import { FeathersKoaContext } from './declarations';

const debug = createDebug('@feathersjs/koa:authentication');

interface MiddlewareSettings {
  service?: string;
  strategies?: string[];
}

export function authentication (settings: MiddlewareSettings = {}) {
  return async (ctx: FeathersKoaContext, next: Next) => {
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

    const { req, res } = ctx as any;
    const authentication = await service.parse(req, res, ...authStrategies);

    if (authentication) {
      debug('Parsed authentication from HTTP header', authentication);
      ctx.feathers.authentication = authentication;
    }

    return next();
  };
}
