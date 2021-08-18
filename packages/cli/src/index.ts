/* eslint-disable @typescript-eslint/no-var-requires, no-console */
import path from 'path';
import {
  engine, getRunnerArgs, Logger, RunnerConfig, RunnerArgs
} from '@feathersjs/hygen';
import updateNotifier from 'update-notifier';
import program from 'commander';

import { loadJSON, locateTemplates, getHelpers } from './utils';

const selfPkg = require('../package.json');

export const DEFAULT_SUBTYPE = 'new';

export async function generate (runnerArgs: RunnerArgs, config?: RunnerConfig) {
  const logger = new Logger(console.log.bind(console));
  const pkg = await loadJSON(path.join(process.cwd(), 'package.json'));
  const { language } = pkg.feathers || {};
  const helpers = await getHelpers(pkg, selfPkg, logger, generate);
  const templates = await locateTemplates(runnerArgs);

  return engine({
    ...runnerArgs,
    subaction: runnerArgs.subaction || (language && `\\/${language}\\/`)
  }, {
    debug: !!process.env.FEATHERS_DEBUG,
    cwd: process.cwd(),
    exec: (action: string) => {
      const [command, ...args] = action.split(' ');
      const spawn = require('execa');

      logger.notice(`\nRunning "${command}", hold tight...\n`);

      return spawn(command, args, {
        stdio: 'inherit'
      });
    },
    createPrompter: () => require('enquirer'),
    ...config,
    helpers,
    logger,
    templates
  });
}

export function cli (argv: string[]) {
  program.version(selfPkg.version)
    .usage('generate [type] [subtype]');

  program.command('generate')
    .alias('g')
    .description('Run a Feathers generator')
    .allowUnknownOption()
    .action((_command: any, args: string[]) => {
      const [type, ...otherArgs] = args;
      const _args = !args[1] || args[1].startsWith('--')
        ? [type, DEFAULT_SUBTYPE, ...otherArgs]
        : [...args];

      generate(getRunnerArgs(_args))
        .then(() => {
          return { success: true };
        })
        .catch(error => {
          console.error(error);
          return { success: false };
        })
        .then(({ success }) => process.exit(success ? 0 : 1));
    });

  updateNotifier({ pkg: selfPkg }).notify();

  program.parse(argv);

  if (argv.length === 2) {
    program.help();
  }
}
