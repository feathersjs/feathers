const path = require('path');
const { readFile } = require('fs/promises');
const loadJSON = name => readFile(name).then(JSON.parse).catch(() => ({}));

module.exports = {
  async prompt () {
    const { feathers } = await loadJSON(path.join(process.cwd(), 'package.json'));
    const hasSocketio = feathers.transports.includes('websockets');
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
      'eslint',
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

    return {
      hasSocketio,
      dependencies,
      devDependencies
    };
  }
}
