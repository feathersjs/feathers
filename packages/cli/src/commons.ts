import fs from 'fs'
import { join } from 'path'
import { PackageJson } from 'type-fest'
import { readFile, writeFile } from 'fs/promises'
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
import prettier, { Options as PrettierOptions } from 'prettier'
import path from 'path'

export const { version } = JSON.parse(fs.readFileSync(join(__dirname, '..', 'package.json')).toString())

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
  /**
   * The main schema definition format
   */
  schema: 'typebox' | 'json'
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
            ...ctx.dependencyVersions,
            '@feathersjs/cli': version
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

/**
 * Checks if the current context contains a valid generated application. This is necesary for most
 * generators (besides the app generator).
 *
 * @param ctx The context to check against
 * @returns Throws an error or returns the original context
 */
export const checkPreconditions =
  () =>
  async <T extends FeathersBaseContext>(ctx: T) => {
    if (!ctx.feathers) {
      throw new Error(`Can not run generator since the current folder does not appear to be a Feathers application.
Either your package.json is missing or it does not have \`feathers\` property.
`)
    }

    return ctx
  }

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

  return fixLocalImports(restoreNewLines(transpiled.outputText))
}

const getFileName = async <C extends PinionContext & { language: 'js' | 'ts' }>(
  target: Callable<string, C>,
  ctx: C
) => `${await getCallable(target, ctx)}.${ctx.language}`

/**
 * The default configuration for prettifying files
 */
export const PRETTIERRC: PrettierOptions = {
  tabWidth: 2,
  useTabs: false,
  printWidth: 110,
  semi: false,
  trailingComma: 'none',
  singleQuote: true
}

/*
 * Format a source file using Prettier. Will use the local configuration, the settings set in
 * `options` or a default configuration
 *
 * @param target The file to prettify
 * @param options The Prettier options
 * @returns The updated context
 */
export const prettify =
  <C extends PinionContext & { language: 'js' | 'ts' }>(
    target: Callable<string, C>,
    options: PrettierOptions = PRETTIERRC
  ) =>
  async (ctx: C) => {
    const fileName = await getFileName(target, ctx)
    const config = (await prettier.resolveConfig(ctx.cwd)) || options
    const content = (await readFile(fileName)).toString()

    try {
      await writeFile(
        fileName,
        await prettier.format(content, {
          parser: ctx.language === 'ts' ? 'typescript' : 'babel',
          ...config
        })
      )
    } catch (error: any) {
      throw new Error(`Error prettifying ${fileName}: ${error.message}`)
    }

    return ctx
  }

/**
 * Render a source file template for the language set in the context.
 *
 * @param templates The JavaScript and TypeScript template to render
 * @param target The target filename without extension (will be added based on language)
 * @returns The updated context
 */
export const renderSource =
  <C extends PinionContext & { language: 'js' | 'ts' }>(
    template: Callable<string, C>,
    target: Callable<string, C>,
    options?: { force: boolean }
  ) =>
  async (ctx: C) => {
    const { language } = ctx
    const fileName = await getFileName(target, ctx)
    const content = language === 'js' ? getJavaScript(await getCallable<string, C>(template, ctx)) : template
    const renderer = renderTemplate(content, fileName, options)

    return renderer(ctx).then(prettify(target))
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
    const fileName = await getFileName(target, ctx)
    const injector = inject(source, location, fileName)

    return injector(ctx).then(prettify(target))
  }
