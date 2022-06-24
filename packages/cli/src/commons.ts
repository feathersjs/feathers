import { PackageJson } from 'type-fest'
import {
  Callable,
  PinionContext,
  loadJSON,
  fromFile,
  getCallable,
  renderTemplate,
  inject,
  Location
} from '@feathershq/pinion'
import * as ts from 'typescript'
import prettier from 'prettier'
import path from 'path'

export type DependencyVersions = { [key: string]: string }

/**
 * The database types supported by this generator
 */
export type DatabaseType = 'mongodb' | 'mysql' | 'postgresql' | 'sqlite' | 'mssql'

/**
 * Returns the name of the Feathers database adapter for a supported database type
 *
 * @param database The type of the database
 * @returns The name of the adapter
 */
export const getDatabaseAdapter = (database: DatabaseType) => (database === 'mongodb' ? 'mongodb' : 'knex')

export type FeathersAppInfo = {
  /**
   * The application language
   */
  language: 'ts' | 'js'
  /**
   * The main database
   */
  database: DatabaseType
  /**
   * The package manager used
   */
  packager: 'yarn' | 'npm'
  /**
   * A list of all chosen transports
   */
  transports: ('rest' | 'websockets')[]
  /**
   * The HTTP framework used
   */
  framework: 'koa' | 'express'
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
   * The language the app is generated in
   */
  language: 'js' | 'ts'
  /**
   * A list dependencies that should be installed with a certain version.
   * Used for installing development dependencies during testing.
   */
  dependencyVersions?: DependencyVersions
}

/**
 * Returns dependencies with the versions from the context attached (if available)
 *
 * @param dependencies The dependencies to install
 * @param versions The dependency version list
 * @returns A list of dependencies with their versions
 */
export const addVersions = (dependencies: string[], versions: DependencyVersions) =>
  dependencies.map((dep) => `${dep}@${versions[dep] ? versions[dep] : 'latest'}`)

/**
 * Loads the application package.json and populates information like the library and test directory
 * and Feathers app specific information.
 *
 * @returns The updated context
 */
export const initializeBaseContext =
  () =>
  <C extends FeathersBaseContext>(ctx: C) =>
    Promise.resolve(ctx)
      .then(loadJSON(fromFile('package.json'), (pkg) => ({ pkg }), {}))
      .then(
        loadJSON(path.join(__dirname, '..', 'package.json'), (pkg: PackageJson) => ({
          dependencyVersions: {
            ...pkg.devDependencies,
            ...ctx.dependencyVersions
          }
        }))
      )
      .then((ctx) => ({
        ...ctx,
        lib: ctx.pkg?.directories?.lib || 'src',
        test: ctx.pkg?.directories?.test || 'test',
        language: ctx.language || ctx.pkg?.feathers?.language,
        feathers: ctx.pkg?.feathers
      }))

const importRegex = /from '(\..*)'/g
const escapeNewLines = (code: string) => code.replace(/\n\n/g, '\n/* :newline: */')
const restoreNewLines = (code: string) => code.replace(/\/\* :newline: \*\//g, '\n')
const fixLocalImports = (code: string) => code.replace(importRegex, "from '$1.js'")

/**
 * Returns the transpiled and prettified JavaScript for a TypeScript source code
 *
 * @param typescript The TypeScript source code
 * @param options TypeScript transpilation options
 * @returns The formatted JavaScript source code
 */
export const getJavaScript = (typescript: string, options: ts.TranspileOptions = {}) => {
  const source = escapeNewLines(typescript)
  const transpiled = ts.transpileModule(source, {
    ...options,
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
      preserveValueImports: true,
      ...options.compilerOptions
    }
  })
  const code = fixLocalImports(restoreNewLines(transpiled.outputText))

  return prettier.format(code, {
    semi: false,
    parser: 'babel',
    singleQuote: true
  })
}

/**
 * Render a source file template for the language set in the context.
 *
 * @param templates The JavaScript and TypeScript template to render
 * @param toFile The target filename without extension (will be added based on language)
 * @returns The updated context
 */
export const renderSource =
  <C extends PinionContext & { language: 'js' | 'ts' }>(
    template: Callable<string, C>,
    toFile: Callable<string, C>,
    options?: { force: boolean }
  ) =>
  async (ctx: C) => {
    const { language } = ctx
    const fileName = await getCallable<string, C>(toFile, ctx)
    const content = language === 'js' ? getJavaScript(await getCallable<string, C>(template, ctx)) : template
    const renderer = renderTemplate(content, `${fileName}.${language}`, options)

    return renderer(ctx)
  }

/**
 * Inject a source template as the language set in the context.
 *
 * @param template The source template to render
 * @param location The location to inject the code to. Must use the target language.
 * @param target The target file name
 * @param transpile Set to `false` if the code should not be transpiled to JavaScript
 * @returns
 */
export const injectSource =
  <C extends PinionContext & { language: 'js' | 'ts' }>(
    template: Callable<string, C>,
    location: Location<C>,
    target: Callable<string, C>,
    transpile = true
  ) =>
  async (ctx: C) => {
    const { language } = ctx
    const source =
      language === 'js' && transpile ? getJavaScript(await getCallable<string, C>(template, ctx)) : template
    const toFile = await getCallable<string, C>(target, ctx)
    const injector = inject(source, location, `${toFile}.${language}`)

    return injector(ctx)
  }
