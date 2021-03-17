import http from 'http';
import express, { Express } from 'express';
import {
  Application as FeathersApplication, Params as FeathersParams,
  HookContext, ServiceMethods, ServiceInterface
} from '@feathersjs/feathers';

interface ExpressUseHandler<T, ServiceTypes> {
  <L extends keyof ServiceTypes> (
    path: ServiceTypes[L] extends never ? string|RegExp : L,
    ...middlewareOrService: (
      Express|express.RequestHandler|
      (ServiceTypes[L] extends never ? ServiceInterface<any> : ServiceTypes[L])
    )[]
  ): T;
  (...expressHandlers: express.RequestHandler[]): T;
  (handler: Express|express.ErrorRequestHandler): T;
}

export interface ExpressOverrides<ServiceTypes> {
  listen(port: number, hostname: string, backlog: number, callback?: () => void): Promise<http.Server>;
  listen(port: number, hostname: string, callback?: () => void): Promise<http.Server>;
  listen(port: number|string|any, callback?: () => void): Promise<http.Server>;
  listen(callback?: () => void): Promise<http.Server>;
  use: ExpressUseHandler<this, ServiceTypes>;
}

export type Application<ServiceTypes = {}, AppSettings = {}> =
  Omit<Express, 'listen'|'use'> &
  FeathersApplication<ServiceTypes, AppSettings> &
  ExpressOverrides<ServiceTypes>;

declare module '@feathersjs/feathers/lib/declarations' {
  export interface ServiceOptions {
    middleware: {
      before: express.RequestHandler[],
      after: express.RequestHandler[]
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request {
      feathers?: Partial<FeathersParams>;
  }

  interface Response {
      data?: any;
      hook?: HookContext;
  }

  interface IRouterMatcher<T> {
      // eslint-disable-next-line
      <P extends Params = ParamsDictionary, ResBody = any, ReqBody = any>(
          path: PathParams,
          ...handlers: (RequestHandler<P, ResBody, ReqBody> | Partial<ServiceMethods<any, any>> | Application)[]
      ): T;
  }
}
