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
  const path = options.authService;
  const service: AuthenticationService = app.service(path);

  if (!service) {
    throw new Error(`'${path}' authentication service must exist before registering @feathersjs/authentication-oauth`);
  }

  const { oauth } = service.configuration;

  if (!oauth) {
    debug(`No oauth configuration found at '${path}'. Skipping oAuth setup.`);
    return;
  }

  const { strategyNames } = service;
  const grant = merge({
    defaults: {
      host: `${app.get('host')}:${app.get('port')}`,
      path: '/auth',
      protocol: app.get('env') === 'production' ? 'https' : 'http',
      transport: 'session'
    }
  }, omit(oauth, 'redirect'));

  each(grant, (value, key) => {
    if (key !== 'defaults') {
      value.callback = value.callback || `/auth/${key}/authenticate`;

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
