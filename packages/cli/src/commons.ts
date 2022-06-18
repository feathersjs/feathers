import { PackageJson } from 'type-fest'
import { Callable, PinionContext, loadJSON, fromFile, getCallable, renderTemplate } from '@feathershq/pinion'
import * as ts from 'typescript'
import prettier from 'prettier'

export type FeathersAppInfo = {
  /**
   * The application language
   */
  language: 'ts' | 'js'
  /**
   * The main database
   */
  database: 'knex' | 'mongodb' | 'custom'
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
}

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
      .then((ctx) => ({
        ...ctx,
        lib: ctx.pkg?.directories?.lib || 'src',
        test: ctx.pkg?.directories?.test || 'test',
        language: ctx.pkg?.feathers?.language || 'ts',
        feathers: ctx.pkg?.feathers
      }))

const importRegex = /from '(\..*)'/g
const escapeNewLines = (code: string) => code.replace(/\n\n/g, '\n/* :newline: */')
const restoreNewLines = (code: string) => code.replace(/\/\* :newline: \*\//g, '\n')
const fixLocalImports = (code: string) => code.replace(importRegex, "from '$1.js'")

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
 * Render a source file template for the language set in the context. Will do nothing
 * it there is no template for the selected language.
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
    if (!template) {
      return ctx
    }

    const { language } = ctx
    const fileName = await getCallable<string, C>(toFile, ctx)
    const content = language === 'js' ? getJavaScript(await getCallable<string, C>(template, ctx)) : template
    const renderer = renderTemplate(content, `${fileName}.${language}`, options)

    return renderer(ctx)
  }

/**
 * Returns the TypeScript or transpiled JavaScript source code
 *
 * @param template The source template
 * @returns
 */
export const getSource =
  <C extends PinionContext & { language: 'js' | 'ts' }>(template: Callable<string, C>) =>
  async <T extends C>(ctx: T) => {
    const { language } = ctx
    const source = await getCallable<string, C>(template, ctx)

    return language === 'js' ? getJavaScript(source) : source
  }
