import Debug from 'debug';
import { merge, flatten } from 'lodash';
import { NextFunction, RequestHandler } from 'express';

const debug = Debug('@feathersjs/express/authentication');

type StrategyOptions = {
  service?: string;
  strategies: string[]
};

const normalizeStrategy = (_settings: string|StrategyOptions, ..._strategies: string[]) =>
  typeof _settings === 'string'
    ? { strategies: flatten([ _settings, ..._strategies ]) }
    : _settings;

export function parseAuthentication (settings: any = {}): RequestHandler {
  return function (req, res, next) {
    const app = req.app as any;
    const service = app.defaultAuthentication ? app.defaultAuthentication(settings.service) : null;

    if (service === null) {
      return next();
    }

    const config = service.configuration;
    const authStrategies = config.parseStrategies || config.authStrategies || [];

    if (authStrategies.length === 0) {
      debug('No `authStrategies` or `parseStrategies` found in authentication configuration');
      return next();
    }

    service.parse(req, res, ...authStrategies)
      .then((authentication: any) => {
        if (authentication) {
          debug('Parsed authentication from HTTP header', authentication);
          merge(req, {
            authentication,
            feathers: { authentication }
          });
        }

        next();
      }).catch(next);
  };
}

export function authenticate (_settings: string|StrategyOptions, ..._strategies: string[]) {
  const settings = normalizeStrategy(_settings, ..._strategies);

  if (!Array.isArray(settings.strategies) || settings.strategies.length === 0) {
    throw new Error('\'authenticate\' middleware requires at least one strategy name');
  }

  return (_req: Request, _res: Response, next: NextFunction) => {
    const req = _req as any;
    const { app, authentication } = req;
    const service = app.defaultAuthentication(settings.service);

    debug('Authenticating with Express middleware and strategies', settings.strategies);

    service.authenticate(authentication, req.feathers, ...settings.strategies)
      .then((authResult: any) => {
        debug('Merging request with', authResult);
        merge(req, authResult);

        next();
      }).catch(next);
  };
}
