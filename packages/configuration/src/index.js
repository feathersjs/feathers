import makeDebug from 'debug';
import path from 'path';

const debug = makeDebug('feathers:configuration');
const config = require('config');
const separator = path.sep;

export default module.exports = function () {
  return function () {
    let app = this;

    const convert = current => {
      const result = Array.isArray(current) ? [] : {};

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
            } else if (value.indexOf('.') === 0 || value.indexOf('..') === 0) {
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
    debug(`Initializing configuration for ${env} environment`);
    const conf = convert(config);

    if (!app) {
      return conf;
    }

    Object.keys(conf).forEach(name => {
      let value = conf[name];
      debug(`Setting ${name} configuration value to`, value);
      app.set(name, value);
    });
  };
};
