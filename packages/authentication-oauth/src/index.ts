import { merge, each } from 'lodash';
import Debug from 'debug';
import { Application } from '@feathersjs/feathers';
import { AuthenticationService } from '@feathersjs/authentication';
import { OAuthStrategy } from './strategy';
import { default as setupExpress } from './express';

const debug = Debug('@feathersjs/authentication-oauth');

export interface OauthSetupSettings {
  service?: string;
}

export const setup = (options: OauthSetupSettings = {}) => (app: Application) => {
  const path = options.service || app.get('defaultAuthentication');
  const service: AuthenticationService = app.service(path);

  if (!service) {
    throw new Error(`'${path}' authentication service must exist before registering @feathersjs/authentication-oauth`);
  }

  const { oauth } = service.configuration;

  if (!oauth) {
    debug(`No oauth configuration found on ${path}. Skipping oAuth setup.`);
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
  }, oauth);

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

export const express = (options: OauthSetupSettings = {}) => (app: Application) => {
  app.configure(setup(options));
  app.configure(setupExpress());
};
