import { generator, toFile, when, renderTemplate } from '@feathershq/pinion'
import { AppGeneratorContext } from '../index'

const template = ({ framework }: AppGeneratorContext) =>
  `import { HookContext as FeathersHookContext, NextFunction } from '@feathersjs/feathers'
import { Application as FeathersApplication } from '@feathersjs/${framework}'
import { ConfigurationSchema } from './configuration'

export { NextFunction }

export interface Configuration extends ConfigurationSchema {}

// A mapping of service names to types. Will be extended in service files.
export interface ServiceTypes {}

// The application instance type that will be used everywhere else
export type Application = FeathersApplication<ServiceTypes, Configuration>

export type HookContext = FeathersHookContext<Application>
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
