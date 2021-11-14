import { Application } from '@feathersjs/feathers';
import { createDebug } from '@feathersjs/commons';
import config from 'config';

const debug = createDebug('@feathersjs/configuration');

export = function init () {
  return (app?: Application) => {
    if (!app) {
      return config;
    }

    debug(`Initializing configuration for ${config.util.getEnv('NODE_ENV')} environment`);

    Object.keys(config).forEach(name => {
      const value = (config as any)[name];
      debug(`Setting ${name} configuration value to`, value);
      app.set(name, value);
    });

    return config;
  };
}
