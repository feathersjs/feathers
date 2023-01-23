import { generator, toFile, when, renderTemplate } from '@feathershq/pinion'
import { AppGeneratorContext } from '../index'

const template = ({
  framework
}: AppGeneratorContext) => /* ts */ `// For more information about this file see https://dove.feathersjs.com/guides/cli/typescript.html
import { FeathersHookContext, NextFunction } from '@feathersjs/feathers'
${
  framework === 'koa'
    ? `import { KoaApplication } from '@feathersjs/koa'`
    : `import { ExpressApplication } from '@feathersjs/express'`
}
import { ApplicationConfiguration } from './configuration'

export { NextFunction }

// The types for app.get(name) and app.set(name)
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Configuration extends ApplicationConfiguration {}

// A mapping of service names to types. Will be extended in service files.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServiceTypes {}

// The application instance type that will be used everywhere else
${
  framework === 'koa'
    ? `export type Application = KoaApplication<ServiceTypes, Configuration>`
    : `export type Application = ExpressApplication<ServiceTypes, Configuration>`
}

// The context for hook functions - can be typed with a service class
export type HookContext<S = any> = FeathersHookContext<Application, S>
`

export const generate = (ctx: AppGeneratorContext) =>
  generator(ctx).then(
    when<AppGeneratorContext>(
      ({ language }) => language === 'ts',
      renderTemplate(
        template,
        toFile<AppGeneratorContext>(({ lib }) => lib, 'declarations.ts')
      )
    )
  )
