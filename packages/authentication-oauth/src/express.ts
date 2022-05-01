import grant from 'grant';
import session from 'express-session';
import { Request, Response, NextFunction } from 'express';
import { createDebug } from '@feathersjs/commons';
import { Application } from '@feathersjs/feathers';
import { AuthenticationResult } from '@feathersjs/authentication';
import {
  Application as ExpressApplication,
  original as originalExpress
} from '@feathersjs/express';
import { OauthSetupSettings } from './utils';
import { OAuthStrategy } from './strategy';

const grantInstance = grant.express();
const debug = createDebug('@feathersjs/authentication-oauth/express');

declare module 'express-session' {
  interface SessionData {
      redirect: string;
      accessToken: string;
      query: { [key: string]: any };
      grant: { [key: string]: any };
      headers: { [key: string]: any };
  }
}

export default (options: OauthSetupSettings) => {
  return (feathersApp: Application) => {
    const { authService, linkStrategy } = options;
    const app = feathersApp as ExpressApplication;
    const config = app.get('grant');

    if (!config) {
      debug('No grant configuration found, skipping Express oAuth setup');
      return;
    }

    const { prefix } = config.defaults;
    const expressSession = options.expressSession || session({
      secret: Math.random().toString(36).substring(7),
      saveUninitialized: true,
      resave: true
    });
    const grantApp = grantInstance(config);
    const authApp = originalExpress();

    authApp.use(expressSession);

    authApp.get('/:name', (req: Request, _res: Response, next: NextFunction) => {
      const { feathers_token, redirect, ...query } = req.query;

      if (feathers_token) {
        debug('Got feathers_token query parameter to link accounts', feathers_token);
        req.session.accessToken = feathers_token as string;
      }
      req.session.redirect = redirect as string;
      req.session.query = query;
      req.session.headers = req.headers;
      if (typeof(req.session.save) === 'function') {
        req.session.save((err: any) => {
          if (err) {
            next(`Error storing session: ${err}`);
          } else {
            next();
          }
        });
      }
      else {
        next();
      }
    });

    authApp.get('/:name/authenticate', async (req: Request, res: Response, next: NextFunction) => {
      const { name } = req.params ;
      const { accessToken, grant, query = {}, redirect, headers } = req.session;
      const service = app.defaultAuthentication(authService);
      const [ strategy ] = service.getStrategies(name) as OAuthStrategy[];
      const params = {
        ...req.feathers,
        authStrategies: [ name ],
        authentication: accessToken ? {
          strategy: linkStrategy,
          accessToken
        } : null,
        query,
        redirect,
        headers
      };
      const sendResponse = async (data: AuthenticationResult|Error) => {
        try {
          const redirect = await strategy.getRedirect(data, params);

          if (redirect !== null) {
            res.redirect(redirect);
          } else if (data instanceof Error) {
            throw data;
          } else {
            res.json(data);
          }
        } catch (error: any) {
          debug('oAuth error', error);
          next(error);
        }
      };

      try {
        const payload = config.defaults.transport === 'session' ?
          grant.response : req.query;
        const authentication = {
          strategy: name,
          ...payload
        };

        await new Promise<void>((resolve, reject) => {
          if (req.session.destroy) {
            req.session.destroy((err: any) => err ? reject(err) : resolve());
          }
          else {
            req.session = null;
            resolve();
          }
        });

        debug(`Calling ${authService}.create authentication with strategy ${name}`);

        const authResult = await service.create(authentication, params);

        debug('Successful oAuth authentication, sending response');

        await sendResponse(authResult);
      } catch (error: any) {
        debug('Received oAuth authentication error', error.stack);
        await sendResponse(error);
      }
    });

    authApp.use(grantApp);

    app.set('grant', grantApp.config);
    app.use(prefix, authApp);
  };
};
