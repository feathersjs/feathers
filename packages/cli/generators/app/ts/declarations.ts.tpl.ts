import { generator, renderTemplate, toFile } from '@feathershq/pinion'
import { AppGeneratorContext } from '../index'

const template = ({ framework }: AppGeneratorContext) =>
`import { HookContext as FeathersHookContext } from '@feathersjs/feathers';
import { Application as FeathersApplication } from '@feathersjs/${framework}';

// A mapping of service names to types. Will be extended in service files.
export interface ServiceTypes {}

// The application instance type that will be used everywhere else
export type Application = FeathersApplication<ServiceTypes>;

export type HookContext = FeathersHookContext<Application>;
`

export const generate = (ctx: AppGeneratorContext) => generator(ctx)
  .then(renderTemplate(template, toFile(({ lib } : AppGeneratorContext) => lib, 'declarations.ts')))
