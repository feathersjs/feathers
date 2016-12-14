/*
 * A Feather Passport adapter so that it plays
 * nicely with Feathers services but remains
 * engine and transport agnostic.
 */
import initialize from './initialize';
import authenticate from './authenticate';
import makeDebug from 'debug';

const debug = makeDebug('feathers-authentication:passport');

export default function feathersPassport (options) {
  const app = this;

  debug('Initializing Feathers passport adapter');

  return {
    initialize: initialize.call(app, options),
    authenticate: authenticate.call(app, options)
  };
}
