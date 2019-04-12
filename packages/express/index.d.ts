// Type definitions for @feathersjs/express 1.1
// Project: https://feathersjs.com
// Definitions by: Jan Lohage <https://github.com/j2L4e>
//                 Aleksey Klimenko <https://github.com/DadUndead>
//                 Jordan Tucker <https://github.com/jordanbtucker>
// Definitions: https://github.com/feathersjs-ecosystem/feathers-typescript
// TypeScript Version: 2.3

import { Application as FeathersApplication } from '@feathersjs/feathers';
import * as express from 'express';

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
        logger?: { error?: (msg: string) => void | null },
        html?: any,
        json?: any
    }): express.ErrorRequestHandler;

    notFound (): express.RequestHandler;

    parseAuthentication (...strategies: string[]): express.RequestHandler;
    authenticate (...strategies: string[]): express.RequestHandler;
}

declare namespace feathersExpress {
    type Application<T = any> = express.Application & FeathersApplication<T>;
}
