import { join } from 'path'
import { VariablesAppBase } from '..';
import { GeneratorContext, RenderResult } from '../../../../src';

export function render (context: GeneratorContext<VariablesAppBase>): RenderResult {
  const to = join(context.h.lib, 'declarations.ts')
  const body = `
import { HookContext as FeathersHookContext } from '@feathersjs/feathers';
import { Application as FeathersApplication } from '@feathersjs/${context.h.feathers.framework}';

// A mapping of service names to types. Will be extended in service files.
export interface ServiceTypes {}

// The application instance type that will be used everywhere else
export type Application = FeathersApplication<ServiceTypes>;

export type HookContext = FeathersHookContext<Application>;
`

  return { 
    body, 
    to
  }
}