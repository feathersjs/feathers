import http from 'http';
import express, { Express } from 'express';
import {
  Application as FeathersApplication, Params as FeathersParams,
  HookContext, ServiceMethods, ServiceInterface
} from '@feathersjs/feathers';

interface ExpressUseHandler<T, Services> {
  <L extends keyof Services & string> (
    path: L,
    ...middlewareOrService: (
      Express|express.RequestHandler|
      (keyof any extends keyof Services ? ServiceInterface : Services[L])
    )[]
  ): T;
  (path: string|RegExp, ...expressHandlers: express.RequestHandler[]): T;
  (...expressHandlers: express.RequestHandler[]): T;
  (handler: Express|express.ErrorRequestHandler): T;
}

export interface ExpressOverrides<Services> {
  listen(port: number, hostname: string, backlog: number, callback?: () => void): Promise<http.Server>;
  listen(port: number, hostname: string, callback?: () => void): Promise<http.Server>;
  listen(port: number|string|any, callback?: () => void): Promise<http.Server>;
  listen(callback?: () => void): Promise<http.Server>;
  use: ExpressUseHandler<this, Services>;
}

export type Application<Services = any, Settings = any> =
  Omit<Express, 'listen'|'use'> &
  FeathersApplication<Services, Settings> &
  ExpressOverrides<Services>;

declare module '@feathersjs/feathers/lib/declarations' {
  interface ServiceOptions {
    middleware?: {
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
          ...handlers: (RequestHandler<P, ResBody, ReqBody> | Partial<ServiceMethods> | Application)[]
      ): T;
  }
}
