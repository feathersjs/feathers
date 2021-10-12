import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { Logger, RunnerArgs, RunnerConfig } from '@feathersjs/hygen';
import { ChildProcess } from 'child_process';

type PackageJSON = { [key: string]: any };

const { stat, readFile } = fs.promises;

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

export async function getHelpers (pkg: PackageJSON, self: PackageJSON, _logger: Logger, generate: any) {
  const helpers = {
    _,
    pkg,
    generate,
    lib: pkg.directories?.lib,
    test: pkg.directories?.test,
    feathers: pkg.feathers,
    install (config: RunnerConfig, names: string[], dev = false) {
      // Adds version numbers to dependencies if it is registered
      const deps = names.filter(name => !!name).map(name =>
        self.devDependencies[name]
          ? `${name}@${self.devDependencies[name]}`
          : name
      );
      const { packager } = pkg.feathers;
      const command = `${packager} install ${deps.join(' ')} --${dev ? 'save-dev' : 'save'}`;
      const execute = (command: string) => {
        const child = config.exec(command, '');
        return new Promise((resolve, reject) => child.on('exit', code => {
          if (code !== 0) {
            reject(new Error(`Error executing command ${command}`));
          }
          resolve(code);
        }));
      }

      return execute(command);
    }
  }

  return helpers;
}
