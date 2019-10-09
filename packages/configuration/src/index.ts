import { Application } from '@feathersjs/feathers';
import Debug from 'debug';
import path from 'path';
import config from 'config';

const debug = Debug('@feathersjs/configuration');
const separator = path.sep;

export default function init () {
  return (app?: Application) => {
    const convert = (current: any) => {
      const result: { [key: string]: any } = Array.isArray(current) ? [] : {};

      Object.keys(current).forEach(name => {
        let value = current[name];

        if (typeof value === 'object' && value !== null) {
          value = convert(value);
        }

        if (typeof value === 'string') {
          if (value.indexOf('\\') === 0) {
            value = value.replace('\\', '');
          } else {
            if (process.env[value]) {
              value = process.env[value];
            }
            if (value.indexOf('.') === 0 || value.indexOf('..') === 0) {
              // Make relative paths absolute
              value = path.resolve(
                path.join(config.util.getEnv('NODE_CONFIG_DIR')),
                value.replace(/\//g, separator)
              );
            }
          }
        }

        result[name] = value;
      });

      return result;
    };

    const env = config.util.getEnv('NODE_ENV');
    const conf = convert(config);

    if (!app) {
      return conf;
    }

    debug(`Initializing configuration for ${env} environment`);

    Object.keys(conf).forEach(name => {
      const value = conf[name];
      debug(`Setting ${name} configuration value to`, value);
      app!.set(name, value);
    });

    return conf;
  };
}

if (typeof module !== 'undefined') {
  module.exports = Object.assign(init, module.exports);
}
