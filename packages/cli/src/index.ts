/* eslint-disable @typescript-eslint/no-var-requires, no-console */
import path from 'path';
import { runner, Logger } from 'hygen';
import updateNotifier from 'update-notifier';
import program from 'commander';

import { loadJSON, locateTemplates, getHelpers } from './utils';
import { RunnerConfig } from 'hygen/dist/types';

const selfPkg = require('../package.json');

export async function generator (args: string[], config?: RunnerConfig) {
  const [type, _subtype, ...otherArgs] = args;
  const subtype = !_subtype || _subtype.startsWith('--') ? 'new' : _subtype;
  const runnerArgs =  [type, subtype, ...otherArgs];
  const logger = new Logger(console.log.bind(console));
  const pkg = await loadJSON(path.join(process.cwd(), 'package.json'));
  const helpers = await getHelpers(pkg, selfPkg, logger);
  const templates = await locateTemplates(runnerArgs);

  if (!process.env.HYGEN_TMPLS) {
    // Workaround to force the templates we want to use, otherwise
    // Hygen will always look in the local _templates first
    process.env.HYGEN_TMPLS = templates;
  }

  return runner(runnerArgs, {
    helpers,
    templates,
    logger,
    cwd: process.cwd(),
    debug: !!process.env.DEBUG,
    exec: (action, body) => {
      const opts = body && body.length > 0 ? { input: body } : {};
      const execa = require('execa').command(action, { ...opts, shell: true });

      execa.stdout.pipe(process.stdout);

      return execa;
    },
    createPrompter: () => require('enquirer'),
    ...config
  });
}

export function cli (argv: string[]) {
  program.version(selfPkg.version)
    .usage('generate [type] [subtype]');

  program.command('generate')
    .alias('g')
    .description('Run a Feathers generator')
    .allowUnknownOption()
    .action((_command, args) => {
      generator(args)
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
