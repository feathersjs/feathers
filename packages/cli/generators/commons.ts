import { PackageJson } from 'type-fest'
import { Callable, PinionContext, loadJSON, fromFile, getCallable, renderTemplate } from '@feathershq/pinion'

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

type LanguageTemplates<C extends PinionContext> = {
  js?: Callable<string, C>
  ts?: Callable<string, C>
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
    templates: LanguageTemplates<C>,
    toFile: Callable<string, C>,
    options?: { force: boolean }
  ) =>
  async (ctx: C) => {
    const { language } = ctx
    const fileName = await getCallable<string, C>(toFile, ctx)
    const template = templates[language]

    if (template) {
      const renderer = renderTemplate(template, `${fileName}.${language}`, options)

      return renderer(ctx)
    }

    return ctx
  }
