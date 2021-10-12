module.exports = {
  async prompt ({ config }) {
    const { feathers } = config.helpers;
    const hasSocketio = feathers.transports && feathers.transports.includes('websockets');
    const dependencies = [
      '@feathersjs/feathers',
      '@feathersjs/errors',
      '@feathersjs/schema',
      '@feathersjs/configuration',
      '@feathersjs/authentication',
      '@feathersjs/transport-commons',
      'winston'
    ];
    const devDependencies = [
      'nodemon',
      'axios',
      'mocha'
    ];

    if (hasSocketio) {
      dependencies.push('@feathersjs/socketio');
    }

    if (feathers.database !== 'custom') {
      dependencies.push(`feathers-${feathers.database}`);
    }

    if (feathers.framework === 'koa') {
      dependencies.push(
        '@feathersjs/koa',
        'koa-static'
      );
    }

    if (feathers.framework === 'express') {
      dependencies.push(
        '@feathersjs/express',
        'compression',
        'helmet'
      );
    }

    if (feathers.language === 'ts') {
      devDependencies.push(
        '@types/mocha',
        feathers.framework === 'koa' ? '@types/koa-static' : '@types/compression',
        '@types/node',
        'ts-node-dev',
        'typescript',
        'shx'
      );
    }

    return {
      hasSocketio,
      dependencies,
      devDependencies
    };
  },

  async rendered (result, config) {
    const { args: { dependencies, devDependencies } } = result;

    await config.helpers.install(config, dependencies);
    await config.helpers.install(config, devDependencies, true);
  }
}
