// @ts-ignore
import { express as grantExpress } from 'grant';
import Debug from 'debug';
import session from 'express-session';
import { Application } from '@feathersjs/feathers';
import { AuthenticationResult } from '@feathersjs/authentication';
import qs from 'querystring';
import {
  Application as ExpressApplication,
  original as express
} from '@feathersjs/express';
import { OauthSetupSettings } from './utils';
import { OAuthStrategy } from './strategy';

const grant = grantExpress();
const debug = Debug('@feathersjs/authentication-oauth/express');

declare module 'express-session' {
  interface SessionData {
      redirect: string;
      accessToken: string;
      query: { [key: string]: any };
      grant: { [key: string]: any };
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

    const { path } = config.defaults;
    const expressSession = options.expressSession || session({
      secret: Math.random().toString(36).substring(7),
      saveUninitialized: true,
      resave: true
    });
    const grantApp = grant(config);
    const authApp = express();

    authApp.use(expressSession);

    authApp.get('/:name', (req, res) => {
      const { feathers_token, redirect, ...query } = req.query;
      const { name } = req.params as any;

      if (feathers_token) {
        debug(`Got feathers_token query parameter to link accounts`, feathers_token);
        req.session.accessToken = feathers_token as string;
      }
      req.session.redirect = redirect as string;
      req.session.query = query;

      res.redirect(`${path}/connect/${name}?${qs.stringify(query as any)}`);
    });

    authApp.get('/:name/callback', (req: any, res: any) => {
      res.redirect(`${path}/connect/${req.params.name}/callback?${qs.stringify(req.query)}`);
    });

    authApp.get('/:name/authenticate', async (req, res, next) => {
      const { name } = req.params as any;
      const { accessToken, grant, query = {}, redirect } = req.session;
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
        redirect
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
        } catch (error) {
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
          if (!req.session.destroy) {
            req.session = null;
            resolve();
          }

          req.session.destroy(err => err ? reject(err) : resolve());
        });

        debug(`Calling ${authService}.create authentication with strategy ${name}`);

        const authResult = await service.create(authentication, params);

        debug('Successful oAuth authentication, sending response');

        await sendResponse(authResult);
      } catch (error) {
        debug('Received oAuth authentication error', error.stack);
        await sendResponse(error);
      }
    });

    authApp.use(grantApp);

    app.set('grant', grantApp.config);
    app.use(path, authApp);
  };
};
