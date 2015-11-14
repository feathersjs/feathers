import fs from 'fs';
import path from 'path';
import makeDebug from 'debug';

const debug = makeDebug('feathers:configuration');

export default module.exports = function (root, configFolder = 'config') {
  return function() {
    const app = this;
    const env = app.settings.env;
    const config = require(path.join(root, configFolder, 'default.json'));

    debug(`Initializing configuration for ${env} environment`);

    // Dev is our default development. For everything else extend the default
    if(env !== 'development') {
      const envConfig = path.join(root, configFolder, `${env}.json`);
      // We can use sync here since configuration only happens once at startup
      if(fs.existsSync(envConfig)) {
          Object.assign(config, require(envConfig));
      } else {
        debug(`Configuration file for ${env} environment not found at ${envConfig}`);
      }
    }

    Object.keys(config).forEach(name => {
      let value = config[name];

      if(process.env[value]) {
        value = process.env[value];
      }

      // Make relative paths absolute
      if(typeof value === 'string' && (value.indexOf(`.${path.sep}`) === 0 ||
          value.indexOf(`..${path.sep}`) === 0)) {
        value = path.resolve(path.join(root, configFolder), value);
      }

      debug(`Setting ${name} configuration value to`, value);

      app.set(name, value);
    });
  };
};
