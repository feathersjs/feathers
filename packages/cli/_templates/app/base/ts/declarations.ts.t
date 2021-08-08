---
to: "<%= h.lib %>/declarations.ts"
---
import { HookContext as FeathersHookContext } from '@feathersjs/feathers';
import { Application as FeathersApplication } from '@feathersjs/<%= h.feathers.framework %>';

// A mapping of service names to types. Will be extended in service files.
export interface ServiceTypes {}

// The application instance type that will be used everywhere else
export type Application = FeathersApplication<ServiceTypes>;

export type HookContext = FeathersHookContext<Application>;
