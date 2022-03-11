import { generator, renderTemplate, toFile } from '@feathershq/pinion'
import { AppGeneratorContext } from '../index'

const koaAppTemplate = ({ transports }: AppGeneratorContext) =>
`import serveStatic from 'koa-static';
import { feathers } from '@feathersjs/feathers';
import configuration from '@feathersjs/configuration';
import { koa, rest, bodyParser, errorHandler, parseAuthentication } from '@feathersjs/koa';
${transports.includes('websockets') ? 'import socketio from \'@feathersjs/socketio\';' : ''}

import services from './services';
import channels from './channels';
import { Application } from './declarations';

const app: Application = koa(feathers());

// Load our app configuration (see config/ folder)
app.configure(configuration());

// Set up Koa middleware
app.use(serveStatic(app.get('public')));
app.use(errorHandler());
app.use(parseAuthentication());
app.use(bodyParser());

// Configure services and transports
app.configure(rest());
${transports.includes('websockets') ? 'app.configure(socketio());' : ''}
app.configure(services);
app.configure(channels);

export { app };
`

const expressAppTemplate = ({ transports }: AppGeneratorContext) =>
`import compress from 'compression';
import helmet from 'helmet';

import { feathers } from '@feathersjs/feathers';
import * as express from '@feathersjs/express';
import configuration from '@feathersjs/configuration';
${transports.includes('websockets') ? 'import socketio from \'@feathersjs/socketio\';' : ''}

import { logger } from './logger';
import services from './services';
import channels from './channels';
import { Application } from './declarations';

const app: Application = express.default(feathers());

// Load app configuration
app.configure(configuration());
app.use(helmet());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Host the public folder
app.use('/', express.static(app.get('public')));

// Configure services and real-time functionality
app.configure(express.rest());
${transports.includes('websockets') ? 'app.configure(socketio());' : ''}
app.configure(services);
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger }));

export { app };
`

const template = (ctx: AppGeneratorContext) =>
  ctx.framework === 'express' ? expressAppTemplate(ctx) : koaAppTemplate(ctx)

export const generate = (ctx: AppGeneratorContext) => generator(ctx)
  .then(renderTemplate(template, toFile(({ lib }: AppGeneratorContext) => lib, 'app.ts')))
