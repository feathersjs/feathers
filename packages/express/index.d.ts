import { Application as FeathersApplication } from '@feathersjs/feathers';
import express from 'express';

declare const feathersExpress: FeathersExpress;
export = feathersExpress;

type Express = typeof express;

interface FeathersExpress extends Express {
    <T>(app: FeathersApplication<T>): feathersExpress.Application<T>;

    (app?: any): express.Express;

    default: FeathersExpress;

    rest: {
        (handler?: express.RequestHandler): () => void;
        formatter: express.RequestHandler;
    };

    original: Express;

    errorHandler (options?: {
        public?: string,
        logger?: { error: (msg: any) => void, info: (msg: any) => void },
        html?: any,
        json?: any
    }): express.ErrorRequestHandler;

    notFound (): express.RequestHandler;

    parseAuthentication (...strategies: string[]): express.RequestHandler;
    authenticate (...strategies: string[]): express.RequestHandler;
}

declare namespace feathersExpress {
    type Application<T = any> = express.Express & FeathersApplication<T>;
}
