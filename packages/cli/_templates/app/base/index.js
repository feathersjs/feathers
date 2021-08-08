module.exports = {
  async prompt ({ config }) {
    const { feathers } = config.helpers;
    const hasSocketio = feathers.transports && feathers.transports.includes('websockets');
    const dependencies = [
      '@feathersjs/feathers',
      '@feathersjs/errors',
      '@feathersjs/configuration',
      '@feathersjs/authentication',
      '@feathersjs/transport-commons',
      'winston'
    ];
    const devDependencies = [
      'nodemon',
      'axios',
      feathers.tester
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
        `@types/${feathers.tester}`,
        feathers.framework === 'koa' ? '@types/koa-static' : '@types/compression',
        '@types/node',
        'ts-node-dev',
        'typescript',
        'shx'
      )
    }

    return {
      hasSocketio,
      dependencies,
      devDependencies
    };
  }
}
