import { PackageJson } from 'type-fest'
import {
  Argv, PinionContext, generator, runGenerator, loadJSON, fromFile, getContext
} from '@feathershq/pinion'

export type FeathersAppInfo = {
  language: 'ts'|'js'
  database: 'sequelize'|'mongodb'|'custom'
  packager: 'yarn'|'npm'
  transports: ('rest'|'websockets')[]
  framework: 'koa'|'express'
}

export interface AppPackageJson extends PackageJson {
  feathers: FeathersAppInfo
}

export interface FeathersBaseContext extends PinionContext {
  pkg: AppPackageJson
  lib: string
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

export const command = (yargs: Argv) => yargs
  .usage('Usage: $0 <command> [options]')
  .command('app', 'Generate a new app', () => {}, argv => {
    const ctx = getContext<FeathersBaseContext>({
      ...argv
    })

    return generate(ctx)
  })
  .help()
