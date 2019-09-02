import Debug from 'debug';
import { merge, each, omit } from 'lodash';
import { Application } from '@feathersjs/feathers';
import { OAuthStrategy, OAuthProfile } from './strategy';
import { default as setupExpress } from './express';
import { OauthSetupSettings, getDefaultSettings } from './utils';

const debug = Debug('@feathersjs/authentication-oauth');

export { OauthSetupSettings, OAuthStrategy, OAuthProfile };

export const setup = (options: OauthSetupSettings) => (app: Application) => {
  const service = app.defaultAuthentication ? app.defaultAuthentication(options.authService) : null;

  if (!service) {
    throw new Error('An authentication service must exist before registering @feathersjs/authentication-oauth');
  }

  const { oauth } = service.configuration;

  if (!oauth) {
    debug(`No oauth configuration found in authentication configuration. Skipping oAuth setup.`);
    return;
  }

  const { strategyNames } = service;
  const { path = '/oauth' } = oauth.defaults || {};
  const port = String(app.get('port'));
  const protocol = app.get('env') === 'production' ? 'https' : 'http';
  
  // Omit standard protocol ports from the default hostname
  let host = app.get('host');
  if ((protocol === 'https' && port !== '443') || (protocol === 'http' && port !== '80')) {
    host += ':' + port;
  }
  
  const grant = merge({
    defaults: {
      path,
      host,
      protocol,
      transport: 'session'
    }
  }, omit(oauth, 'redirect'));
  
  const getUrl = (url: string) => {
    const { defaults } = grant;
    return `${defaults.protocol}://${defaults.host}${path}/${url}`;
  };

  each(grant, (value, name) => {
    if (name !== 'defaults') {
      value.callback = value.callback || getUrl(`${name}/authenticate`);
      value.redirect_uri = value.redirect_uri || getUrl(`${name}/callback`);

      if (!strategyNames.includes(name)) {
        debug(`Registering oAuth default strategy for '${name}'`);
        service.register(name, new OAuthStrategy());
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
