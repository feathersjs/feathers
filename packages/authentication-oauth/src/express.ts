// @ts-ignore
import { express as grantExpress } from 'grant';
import session from 'express-session';
import querystring from 'querystring';
import { Application } from '@feathersjs/feathers';
import { AuthenticationService } from '@feathersjs/authentication';
import {
  Application as ExpressApplication,
  original as express
} from '@feathersjs/express';

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
    const authApp = express();

    authApp.use(session({
      secret,
      resave: true,
      saveUninitialized: true
    }));

    authApp.get('/:name', (req, res) => {
      if (req.query.accessToken) {
        req.session.accessToken = req.query.accessToken;
      }

      const { name } = req.params;
      const qs = querystring.stringify(req.query);

      res.redirect(`/auth/connect/${name}?${qs}`);
    });

    authApp.get('/:name/authenticate', async (req, res, next) => {
      try {
        const { name } = req.params;
        const service: AuthenticationService = app.service('authentication');
        const payload = config.defaults.transport === 'session' ?
          req.session.grant.response : req.query;
        const authentication = {
          strategy: name,
          ...payload
        };
        const authResult = await service.create(authentication, {
          provider: 'rest',
          jwtStrategies: [ name ]
        });

        res.json(authResult);
      } catch (error) {
        next(error);
      }
    });

    authApp.use(grantApp);

    app.set('grant', grantApp.config);
    app.use('/auth', authApp);
  };
};
