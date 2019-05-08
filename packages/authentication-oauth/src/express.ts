// @ts-ignore
import { express as grantExpress } from 'grant';
import Debug from 'debug';
import querystring from 'querystring';
import { Application } from '@feathersjs/feathers';
import { AuthenticationService, AuthenticationResult } from '@feathersjs/authentication';
import {
  Application as ExpressApplication,
  original as express
} from '@feathersjs/express';
import { OauthSetupSettings } from './utils';
import { OAuthStrategy } from '.';

const grant = grantExpress();
const debug = Debug('@feathersjs/authentication-oauth/express');

export default (options: OauthSetupSettings) => {
  return (feathersApp: Application) => {
    const { path, authService, linkStrategy } = options;
    const app = feathersApp as ExpressApplication;
    const config = app.get('grant');

    if (!config) {
      debug('No grant configuration found, skipping Express oAuth setup');
      return;
    }

    const grantApp = grant(config);
    const authApp = express();

    authApp.use(options.expressSession);

    authApp.get('/:name', (req, res) => {
      const { name } = req.params;
      const { feathers_token, ...query } = req.query;
      const qs = querystring.stringify(query);

      if (feathers_token) {
        debug(`Got feathers_token query parameter to link accounts`, feathers_token);
        req.session.accessToken = feathers_token;
      }

      const redirect = `${path}/connect/${name}${qs.length ? '?' + qs : ''}`;

      debug(`Starting ${name} oAuth flow, redirecting to ${redirect}`);

      res.redirect(redirect);
    });

    authApp.get('/:name/authenticate', async (req, res, next) => {
      const { name } = req.params;
      const { accessToken, grant } = req.session;
      const service: AuthenticationService = app.service(authService);
      const [ strategy ] = service.getStrategies(name) as OAuthStrategy[];
      const sendResponse = async (data: AuthenticationResult|Error) => {
        try {
          const redirect = await strategy.getRedirect(data);

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

        const params = {
          provider: 'rest',
          authStrategies: [ name ],
          authentication: accessToken ? {
            strategy: linkStrategy,
            accessToken
          } : null
        };

        const authentication = {
          strategy: name,
          ...payload
        };

        debug(`Calling ${authService}.create authentication with strategy ${name}`);

        const authResult = await service.create(authentication, params);

        debug('Successful oAuth authentication, sending response');

        await sendResponse(authResult);
      } catch (error) {
        debug('Received oAuth authentication error', error);
        await sendResponse(error);
      }
    });

    authApp.use(grantApp);

    app.set('grant', grantApp.config);
    app.use(path, authApp);
  };
};
