export { Logger } from './logger';
export { engine } from './engine';
import { RunnerArgs } from './types';
import yargs from 'yargs-parser';

export const getRunnerArgs = (argv: RunnerArgs | string[]): RunnerArgs => {
  if (Array.isArray(argv)) {
    const parsed = yargs(argv);
    const [generator, _action, name] = parsed._;
    const { _, ...args } = parsed;
    const [action, subaction] = _action.split(':');

    return {
      generator,
      action,
      subaction,
      name,
      args
    };
  }

  const [action, subaction] = argv.action.split(':');

  return {
    action,
    subaction,
    ...argv
  };
};

export * from './types';
