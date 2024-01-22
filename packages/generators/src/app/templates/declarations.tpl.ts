import { toFile, when, renderTemplate } from '@featherscloud/pinion'
import { AppGeneratorContext } from '../index.js'

const template = ({
  framework,
  schema
}: AppGeneratorContext) => /* ts */ `// For more information about this file see https://dove.feathersjs.com/guides/cli/typescript.html
import { HookContext as FeathersHookContext, NextFunction } from '@feathersjs/feathers'
import { Application as FeathersApplication } from '@feathersjs/${framework}'
${
  schema === false
    ? `type ApplicationConfiguration = any`
    : `import { ApplicationConfiguration } from './configuration'`
}

export type { NextFunction }

// The types for app.get(name) and app.set(name)
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Configuration extends ApplicationConfiguration {}

// A mapping of service names to types. Will be extended in service files.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServiceTypes {}

// The application instance type that will be used everywhere else
export type Application = FeathersApplication<ServiceTypes, Configuration>

// The context for hook functions - can be typed with a service class
export type HookContext<S = any> = FeathersHookContext<Application, S>
`

export const generate = (ctx: AppGeneratorContext) =>
  Promise.resolve(ctx).then(
    when<AppGeneratorContext>(
      ({ language }) => language === 'ts',
      renderTemplate(
        template,
        toFile<AppGeneratorContext>(({ lib }) => lib, 'declarations.ts')
      )
    )
  )
