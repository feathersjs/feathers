import { ResolverStatus  } from './resolver';

export * from './schema';
export * from './resolver';
export * from './hooks';
export * from './query';

export type Infer<S extends { _type: any }> = S['_type'];

declare module '@feathersjs/feathers/lib/declarations' {
  interface Params {
    resolve?: ResolverStatus<any, HookContext>;
  }
}
