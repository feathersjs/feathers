import Koa from 'koa';
import { Server } from 'http';
import { Application as FeathersApplication } from '@feathersjs/feathers';
import '@feathersjs/authentication';

export type ApplicationAddons = {
  listen (port?: number, ...args: any[]): Promise<Server>;
}

export type Application<T = any, C = any> =
  Omit<Koa, 'listen'> & FeathersApplication<T, C> & ApplicationAddons;

export type FeathersKoaContext<A = Application> = Koa.Context & {
  app: A;
};
