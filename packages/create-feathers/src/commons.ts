import fs from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PackageJson } from 'type-fest'
import { Callable, PinionContext, loadJSON, fromFile, getCallable, exec } from '@featherscloud/pinion'

// Set __dirname in es module
const __dirname = dirname(fileURLToPath(import.meta.url))

export const { version } = JSON.parse(fs.readFileSync(join(__dirname, '..', 'package.json')).toString())

export type DependencyVersions = { [key: string]: string }

export type FeathersAppInfo = {
  packager: 'yarn' | 'npm' | 'pnpm'

  platform: 'node' | 'deno' | 'bun'

  sse: boolean
}

export interface AppPackageJson extends PackageJson {
  feathers?: FeathersAppInfo
}

export interface FeathersBaseContext extends PinionContext {
  /**
   * Information about the Feathers application (like chosen language, database etc.)
   * usually taken from `package.json`
   */
  feathers: FeathersAppInfo
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
  /**
   * A list dependencies that should be installed with a certain version.
   * Used for installing development dependencies during testing.
   */
  dependencyVersions?: DependencyVersions
}

export interface AppGeneratorData extends FeathersAppInfo {
  /**
   * The application name
   */
  name: string
  /**
   * A short description of the app
   */
  description: string
}

export type AppGeneratorContext = FeathersBaseContext & AppGeneratorData

export type AppGeneratorArguments = FeathersBaseContext & Partial<AppGeneratorData>

/**
 * Loads the application package.json and populates information like the library and test directory
 * and Feathers app specific information.
 *
 * @returns The updated context
 */
export const initializeBaseContext =
  () =>
  <C extends FeathersBaseContext>(ctx: C) =>
    Promise.resolve(ctx).then(loadJSON(fromFile('package.json'), (pkg) => ({ pkg }), {}))

/**
 * A special error that can be thrown by generators. It contains additional
 * information about the error that can be used to display a more helpful
 * error message to the user.
 */
export class FeathersGeneratorError extends Error {
  /**
   * Additional information about the error. This can include things like
   * the reason for the error and suggested actions to take.
   */
  context?: Record<string, unknown>

  /**
   * Creates a new FeathersGeneratorError
   * @param message The error message
   * @param context Additional information about the error
   */
  constructor(message: string, context?: Record<string, unknown>) {
    super(message)
    this.name = 'FeathersGeneratorError'
    this.context = context
  }
}

export const install =
  <C extends PinionContext>(
    dependencies: Callable<string[], C>,
    dev: Callable<boolean, C>,
    packager: Callable<string, C>
  ) =>
  async (ctx: C) => {
    const dependencyList = await getCallable(dependencies, ctx)
    const packageManager = await getCallable(packager, ctx)
    const isDev = await getCallable(dev, ctx)
    const flag = isDev ? (packageManager === 'yarn' ? ' --dev' : ' --save-dev') : ''
    const command = packageManager === 'yarn' ? 'add' : 'install'

    return exec(`${packageManager} ${command} ${dependencyList.join(' ')}${flag}`, [])(ctx)
  }
