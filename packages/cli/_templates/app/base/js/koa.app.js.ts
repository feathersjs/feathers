import { join } from 'path'
import { VariablesAppBase } from '..';
import { GeneratorContext, RenderResult } from '../../../../src';

export function render (context: GeneratorContext<VariablesAppBase>): RenderResult {
    const to = (context.h.feathers.framework === "koa") 
    ? join(context.h.lib, 'app.js')
    : null;
  const body = `
import serveStatic from 'koa-static';
import { feathers } from '@feathersjs/feathers';
import configuration from '@feathersjs/configuration';
import { koa, rest, bodyParser, errorHandler, authentication } from '@feathersjs/koa';
${ (context.hasSocketio) ? 'import socketio from \'@feathersjs/socketio\'' : '' }

import services from './services/index.js';
import channels from './channels.js';

const app = koa(feathers());

// Load our app configuration (see config/ folder)
app.configure(configuration());

// Set up Koa middleware
app.use(serveStatic(app.get('public')));
app.use(errorHandler());
app.use(authentication());
app.use(bodyParser());
app.use(rest());

// Configure services and real-time functionality
${ (context.hasSocketio) ? 'app.configure(socketio());' : '' }
app.configure(services);
app.configure(channels);

export { app };
`

  return { 
    body, 
    to
  }
}