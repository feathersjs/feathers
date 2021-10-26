import Koa from 'koa';
import { Server } from 'http';
import { Application as FeathersApplication, HookContext, Params } from '@feathersjs/feathers';
import '@feathersjs/authentication';

export type ApplicationAddons = {
  listen (port?: number, ...args: any[]): Promise<Server>;
}

export type Application<T = any, C = any> =
  Omit<Koa, 'listen'> & FeathersApplication<T, C> & ApplicationAddons;

export type FeathersKoaContext<A = Application> = Koa.Context & {
  app: A;
};

declare module 'koa' {
  interface ExtendableContext {
    feathers?: Partial<Params>;
    hook?: HookContext;
  }
}
