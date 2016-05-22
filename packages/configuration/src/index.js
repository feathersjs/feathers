import fs from 'fs';
import path from 'path';
import makeDebug from 'debug';
import deepAssign from 'deep-assign';

const debug = makeDebug('feathers:configuration');
const separator = path.sep;

export default module.exports = function (root, configFolder = 'config', deep = true) {
  return function() {
    const app = this;
    const env = app.settings.env;
    const convert = current => {
      const result = Array.isArray(current) ? [] : {};

      Object.keys(current).forEach(name => {
        let value = current[name];

        if(typeof value === 'object') {
          value = convert(value);
        }

        if(typeof value === 'string') {
          if(value.indexOf('\\') === 0) {
            value = value.replace('\\', '');
          } else {
            if(process.env[value]) {
              value = process.env[value];
            } else if(value.indexOf('.') === 0 || value.indexOf('..') === 0) {
              // Make relative paths absolute
              value = path.resolve(
                path.join(root, configFolder),
                value.replace(/\//g, separator)
              );
            }
          }
        }

        result[name] = value;
      });

      return result;
    };

    let config = convert(require(path.join(root, configFolder, 'default')));

    debug(`Initializing configuration for ${env} environment`);

    // Dev is our default development. For everything else extend the default
    if(env !== 'development') {
      const envConfig = path.join(root, configFolder, env);
      // We can use sync here since configuration only happens once at startup
      if(fs.existsSync(`${envConfig}.js`) || fs.existsSync(`${envConfig}.json`)) {
        config = deep ? deepAssign(config, convert(require(envConfig))) :
          Object.assign(config, convert(require(envConfig)));
      } else {
        debug(`Configuration file for ${env} environment not found at ${envConfig}`);
      }
    }

    Object.keys(config).forEach(name => {
      let value = config[name];

      debug(`Setting ${name} configuration value to`, value);

      app.set(name, value);
    });
  };
};
