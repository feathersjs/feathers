import { ExecaReturnValue } from 'execa';
import { LoDashStatic } from 'lodash';
import { PackageJson as _PackageJson } from 'type-fest';

export type FeathersPackageJson = {
  packager: 'npm' | 'yarn'
  language: 'js' | 'ts'
  database: 'sequelize' | 'mongodb' | 'custom'
  transports: ('rest' | 'websockets')[]
  framework: 'express' | 'koa'
}

export type PackageJson = _PackageJson & { feathers: FeathersPackageJson }

export type GeneratorContext<T extends {}> = {
  h: Helpers
  action: string
  actionfolder: string
  cwd: string
  generator: string
  templates: string
} & T;

export type RenderFile = (context: Record<string, any>) => RenderResult;

export type RenderResult = RenderAttributes & {
  body: string
}

export type RenderAttributes = {
  to: string | null
  inject?: boolean
  skipIf?: string | RegExp
  // locations
  prepend?: boolean
  append?: boolean
  before?: boolean
  after?: string
  atLine?: number
  unlessExists?: boolean
  force?: boolean
  from?: string
  eofLast?: boolean
  sh?: string
  message?: string
}

export type Config = {
  helpers: Helpers
}

export type Helpers = {
  _: LoDashStatic
  pkg: PackageJson
  generate: (runnerArgs: RunnerArgs, config?: RunnerConfig) => Promise<EngineResult>
  lib: string
  test: string
  feathers: FeathersPackageJson
  install: ((config: RunnerConfig, names: string[], dev?: boolean) => Promise<unknown>)
}

export type PromptOptions<Q = any, T = any> = {
  prompter: Prompter<Q, T>
  inquirer: Prompter<Q, T>
  args: Arguments
  config: RunnerConfig
}

// #region hygen stuff

export interface Prompter<Q, T> {
  prompt: (arg0: Q) => Promise<T>
}

export interface RenderedAction {
  // file?: string
  attributes: RenderAttributes
  body: string
}

export type Arguments = Record<string, any>

export type RunnerArgs = {
  generator: string
  action: string
  args?: Arguments
  subaction?: string
  name?: string
}

export interface Logger {
  ok: (msg: string) => void
  notice: (msg: string) => void
  warn: (msg: string) => void
  err: (msg: string) => void
  log: (msg: string) => void
  colorful: (msg: string) => void
}

export interface RunnerConfig<H = Helpers> {
  exec?: (sh: string, body: string) => Promise<ExecaReturnValue<string>>
  templates?: string
  cwd?: string
  logger?: Logger
  debug?: boolean
  helpers?: H
  localsDefaults?: any
  createPrompter?: <Q, T>() => Prompter<Q, T>
}

export type PromptList = any[]

export interface InteractiveHook {
  params?(args: Arguments): Promise<Arguments>
  prompt?<Q, T>(promptArgs: PromptOptions<Q, T>): Promise<Arguments>
  // eslint-disable-next-line
  rendered?(result: EngineResult, config: RunnerConfig): Promise<EngineResult>
}

export type HookModule = PromptList | InteractiveHook | null

export type ActionResult = any

export type ParamsResult = {
  templates: string
  generator: string
  action: string
  subaction?: string
  actionfolder?: string
  name?: string
  dry?: boolean
} & Arguments

export interface EngineResult {
  actions: ActionResult[]
  args: ParamsResult
  hookModule: HookModule
}

// #endregion