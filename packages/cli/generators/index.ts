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
  database: 'sequelize'|'mongodb'|'custom'
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
  feathers: FeathersAppInfo
}

export interface FeathersBaseContext extends PinionContext {
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
  .then(loadJSON(fromFile('package.json'), pkg => ({ pkg }), {}))
  .then(ctx => ({
    lib: ctx.pkg?.directories?.lib,
    test: ctx.pkg?.directories?.test,
    ...ctx
  }))
  .then(runGenerator(__dirname, (ctx: FeathersBaseContext) => `${ctx._[0]}`, 'index'))

export const commandRunner = (argv: any) => {
  const ctx = getContext<FeathersBaseContext>({
    ...argv
  })

  return generate(ctx)
}

export const command = (yargs: Argv) => yargs
  .usage('Usage: $0 <command> [options]')
  .command('app', 'Generate a new app', () => {}, commandRunner)
  .command('service', 'Generate a service', () => {}, commandRunner)
  .help()
