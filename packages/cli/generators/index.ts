import { PackageJson } from 'type-fest'
import {
  Argv, PinionContext, generator, runGenerator, loadJSON, fromFile, getContext
} from '@feathershq/pinion'

export type FeathersAppInfo = {
  /**
   * The application language
   */
  language: 'ts'|'js'
  /**
   * The main database
   */
  database: 'knex'|'mongodb'|'custom'
  /**
   * The package manager used
   */
  packager: 'yarn'|'npm'
  /**
   * A list of all chosen transports
   */
  transports: ('rest'|'websockets')[]
  /**
   * The HTTP framework used
   */
  framework: 'koa'|'express'
}

export interface AppPackageJson extends PackageJson {
  feathers?: FeathersAppInfo
}

export const initializeBaseContext = () => <C extends FeathersBaseContext> (ctx: C) => Promise.resolve(ctx)
  .then(loadJSON(fromFile('package.json'), pkg => ({ pkg }), {}))
  .then(ctx => ({
    ...ctx,
    lib: ctx.pkg?.directories?.lib || 'src',
    test: ctx.pkg?.directories?.test || 'test',
    feathers: ctx.pkg?.feathers
  } as C))

export interface FeathersBaseContext extends PinionContext {
  /**
   * Information about the Feathers application (like chosen language, database etc.)
   * usually taken from `package.json`
   */
  feathers: FeathersAppInfo;
  /**
   * The package.json file
   */
  pkg: AppPackageJson
  /**
   * The folder where source files are put
   */
  lib: string
  /**
   * The folder where test files are put
   */
  test: string
}

export const generate = (ctx: FeathersBaseContext) => generator(ctx)
  .then(initializeBaseContext())
  .then(runGenerator(__dirname, (ctx: FeathersBaseContext) => `${ctx._[1]}`, 'index'))

export const commandRunner = (yarg: any) => {
  const ctx = getContext<FeathersBaseContext>({
    ...yarg.argv
  })

  return generate(ctx)
}

export const command = (yargs: Argv) => yargs
  .command('generate', 'Run a generator', yarg =>
    yarg.command('app', 'Generate a new app', commandRunner)
      .command('service', 'Generate a service', commandRunner)
  )
  .usage('Usage: $0 <command> [options]')
  .help()
