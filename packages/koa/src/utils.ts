import Koa from 'koa';
import { Application } from '@feathersjs/feathers';
import '@feathersjs/authentication';

export type FeathersKoaContext<T = any> = Koa.Context & {
  app: Application<T>;
};
