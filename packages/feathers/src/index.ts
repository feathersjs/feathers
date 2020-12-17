// @ts-ignore
import Proto from 'uberproto';
import Application from './application';
import version from './version';
import { Application as ApplicationType } from './declarations'

const baseObject = Object.create(null);

export default function feathers<ServiceTypes = {}> (): ApplicationType<ServiceTypes> {
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
