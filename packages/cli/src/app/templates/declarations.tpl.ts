import { generator, toFile, when, renderTemplate } from '@feathershq/pinion'
import { AppGeneratorContext } from '../index'

const template = ({
  framework
}: AppGeneratorContext) => /* ts */ `import { HookContext as FeathersHookContext, NextFunction } from '@feathersjs/feathers'
import { Application as FeathersApplication } from '@feathersjs/${framework}'
import { ApplicationConfiguration } from './schemas/configuration'

export { NextFunction }

export interface Configuration extends ApplicationConfiguration {}

// A mapping of service names to types. Will be extended in service files.
export interface ServiceTypes {}

// The application instance type that will be used everywhere else
export type Application = FeathersApplication<ServiceTypes, Configuration>

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
