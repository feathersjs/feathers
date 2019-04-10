// @ts-ignore
import { express as grantExpress } from 'grant';
import express from 'express';
import session from 'express-session';
import { Application } from '@feathersjs/feathers';
import { Application as ExpressApplication } from '@feathersjs/express';
import { AuthenticationService } from '@feathersjs/authentication/lib';

const grant = grantExpress();

export default () => {
  return (_app: Application) => {
    const app = _app as ExpressApplication;
    const config = app.get('grant');
    const secret = Math.random().toString(36).substring(7);

    if (!config) {
      throw new Error(`Grant oAuth configuration not found in app.get('grant')`);
    }

    const grantApp = grant(config);
    const authApp = express()
      .use(session({
        secret,
        resave: true,
        saveUninitialized: true
      }))
      .use((req, _res, next) => {
        if (req.query.bearer) {
          req.session.accessToken = req.query.bearer;
        }

        next();
      })
      .use(grantApp)
      .get('/:name/authenticate', async (req, res) => {
        const { name } = req.params;
        const service: AuthenticationService = app.service('authentication');
        const payload = config.defaults.transport === 'session' ?
          req.session.grant.response : req.query;
        const authentication = {
          strategy: name,
          ...payload
        };
        const authResult = await service.authenticate(authentication, {
          provider: 'rest'
        }, name);
        
        res.json(authResult);
      });

    app.use('/auth', authApp);
  };
};
