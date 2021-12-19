import { promises as fsPromises } from 'fs';
import _ from 'lodash';
import path from 'path';
import yargs from 'yargs-parser'
import { Logger } from './nextgen';

import type { Helpers, PackageJson, RunnerArgs, RunnerConfig } from './types';

const { stat, readFile } = fsPromises;

export const TEMPLATE_PATH = '_templates';

export async function loadJSON (file: string) {
  try {
    const data = await readFile(file);

    return JSON.parse(data.toString());
  } catch (error) {
    return {};
  }
}

export function locateTemplates (args: RunnerArgs) {
  const { generator, action } = args;
  const fromFolder = async (folder: string) => {
    const templates = path.join(folder, TEMPLATE_PATH);
    const fullPath = path.join(templates, generator, action);

    await stat(fullPath);

    return templates;
  }

  return fromFolder(process.cwd())
    .catch(() => fromFolder(path.join(process.cwd(), 'node_modules', `@feathersjs/${generator}`)))
    .catch(() => fromFolder(path.join(process.cwd(), 'node_modules', `feathers-${generator}`)))
    .catch(() => fromFolder(path.join(__dirname, '..')))
    .catch(() => {
      throw new Error(`Can not find any generators for 'feathers generate ${generator} ${action}'`);
    });
}

export async function getHelpers (
  pkg: PackageJson,
  self: PackageJson,
  _logger: Logger,
  generate: any
): Promise<Helpers> {
  const helpers: Helpers = {
    _,
    pkg,
    generate,
    lib: pkg.directories?.lib,
    test: pkg.directories?.test,
    feathers: pkg.feathers,
    install: async (config: RunnerConfig, names: string[], dev = false) => {
      // Adds version numbers to dependencies if it is registered
      const deps = names.filter(name => !!name).map(name =>
        self.devDependencies[name]
          ? `${name}@${self.devDependencies[name]}`
          : name
      );
      const { packager } = pkg.feathers;
      const command = `${packager} install ${deps.join(' ')} --${dev ? 'save-dev' : 'save'}`;
      const execute = async (command: string) => {
        try {
          await config.exec(command, '')
        } catch(err) {
          throw new Error(`Error executing command ${command}`);
        }
      }

      return execute(command);
    }
  }

  return helpers;
}

// #region hygen-stuff

export const getRunnerArgs = (argv: RunnerArgs | string[]): RunnerArgs => {
  if (Array.isArray(argv)) {
    const parsed = yargs(argv)
    const [generator, _action, name] = parsed._
    const { _, ...args } = parsed
    const [action, subaction] = _action.split(':')

    return {
      generator,
      action,
      subaction,
      name,
      args
    }
  }

  const [action, subaction] = argv.action.split(':')

  return {
    action,
    subaction,
    ...argv
  }
}

// #endregion