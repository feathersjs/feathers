import Debug from 'debug';
import { merge, each, omit } from 'lodash';
import { Application } from '@feathersjs/feathers';
import { AuthenticationService } from '@feathersjs/authentication';
import { OAuthStrategy, OAuthProfile } from './strategy';
import { default as setupExpress } from './express';
import { OauthSetupSettings, getDefaultSettings } from './utils';

const debug = Debug('@feathersjs/authentication-oauth');

export { OauthSetupSettings, OAuthStrategy, OAuthProfile };

export const setup = (options: OauthSetupSettings) => (app: Application) => {
  const authPath = options.authService;
  const service: AuthenticationService = app.service(authPath);

  if (!service) {
    throw new Error(`'${authPath}' authentication service must exist before registering @feathersjs/authentication-oauth`);
  }

  const { oauth } = service.configuration;

  if (!oauth) {
    debug(`No oauth configuration found at '${authPath}'. Skipping oAuth setup.`);
    return;
  }

  const { strategyNames } = service;
  const { path = '/auth' } = oauth.defaults;
  const grant = merge({
    defaults: {
      path,
      host: `${app.get('host')}:${app.get('port')}`,
      protocol: app.get('env') === 'production' ? 'https' : 'http',
      transport: 'session'
    }
  }, omit(oauth, 'redirect'));

  each(grant, (value, key) => {
    if (key !== 'defaults') {
      value.callback = value.callback || `${path}/${key}/authenticate`;

      if (!strategyNames.includes(key)) {
        debug(`Registering oAuth default strategy for '${key}'`);
        service.register(key, new OAuthStrategy());
      }
    }
  });

  app.set('grant', grant);
};

export const express = (settings: Partial<OauthSetupSettings> = {}) => (app: Application) => {
  const options = getDefaultSettings(app, settings);

  app.configure(setup(options));
  app.configure(setupExpress(options));
};

export const expressOauth = express;
