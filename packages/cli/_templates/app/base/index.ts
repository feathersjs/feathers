import { PromptOptions, RunnerConfig } from "../../../src";

export type VariablesAppBase = {
  hasSocketio: boolean
  dependencies: string[]
  devDependencies: string[]
}

export default {
  async prompt ({ config }: PromptOptions) {
    const { feathers } = config.helpers;
    const hasSocketio = feathers?.transports?.includes('websockets');
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

    if (["mongodb", "sequelize"].includes(feathers?.database)) {
      dependencies.push(`feathers-${feathers.database}`);
    }

    if (feathers?.framework === 'koa') {
      dependencies.push(
        '@feathersjs/koa',
        'koa-static'
      );
    }

    if (feathers?.framework === 'express') {
      dependencies.push(
        '@feathersjs/express',
        'compression',
        'helmet'
      );
    }

    if (feathers?.language === 'ts') {
      devDependencies.push(
        '@types/mocha',
      )
      if (feathers.framework === "koa") {
        devDependencies.push('@types/koa-static')
      }
      if (feathers.framework === "express") {
        devDependencies.push('@types/compression')
      }
      devDependencies.push(
        '@types/node',
        'nodemon',
        'ts-node',
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

  async rendered (result: any, config: RunnerConfig) {
    const { args: { dependencies, devDependencies } } = result;

    await config.helpers.install(config, dependencies);
    await config.helpers.install(config, devDependencies, true);
  }
}
