import type { LoDashStatic } from 'lodash';
import { PackageJson as _PackageJson } from 'type-fest';
import {
  RunnerArgs,
  RunnerConfig as _RunnerConfig,
  EngineResult,
  GeneratorContext as _GeneratorContext,
  PromptOptions as _PromptOptions
} from './nextgen/types';

export {
  RunnerArgs,
  EngineResult
}
export {
  RenderResult,
  InteractiveHook
} from './nextgen/types'

export type FeathersPackageJson = {
  packager: 'npm' | 'yarn'
  language: 'js' | 'ts'
  database: 'sequelize' | 'mongodb' | 'custom'
  transports: ('rest' | 'websockets')[]
  framework: 'express' | 'koa'
}

export type PackageJson = _PackageJson & { feathers: FeathersPackageJson }

export type GeneratorContext<T extends {}> = _GeneratorContext<Helpers, T>

export type PromptOptions = _PromptOptions<Helpers>
export type RunnerConfig = _RunnerConfig<Helpers>

export type Helpers = {
  _: LoDashStatic
  pkg: PackageJson
  generate: (runnerArgs: RunnerArgs, config?: RunnerConfig) => Promise<EngineResult>
  lib: string
  test: string
  feathers: FeathersPackageJson
  install: ((config: RunnerConfig, names: string[], dev?: boolean) => Promise<unknown>)
}