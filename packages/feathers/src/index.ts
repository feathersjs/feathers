// @ts-ignore
import Proto from 'uberproto';
import { _ } from '@feathersjs/commons';
import Application from './application';
import version from './version';

const baseObject = Object.create(null);

export function feathers () {
  const app = Object.create(baseObject);

  // Mix in the base application
  Proto.mixin(Application, app);

  app.init();

  return app;
}

export { version };
export * from './declarations';
export * from './hooks/index';

if (typeof module !== 'undefined') {
  module.exports = Object.assign(feathers, module.exports);
}
