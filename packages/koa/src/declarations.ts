import Koa from 'koa';
import { Application as FeathersApplication } from '@feathersjs/feathers';
import '@feathersjs/authentication';

export type Application<T = any> = Koa & FeathersApplication<T>;

export type FeathersKoaContext<T = any> = Koa.Context & {
  app: Application<T>;
};
