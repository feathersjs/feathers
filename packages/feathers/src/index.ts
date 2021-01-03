import Application from './application';
import version from './version';
import { Application as ApplicationType } from './declarations'

export default function feathers<ServiceTypes = {}> (): ApplicationType<ServiceTypes> {
  const app = Object.create(Application);

  app.init();

  return app;
}

export { version };
export * from './declarations';
export * from './hooks/index';

if (typeof module !== 'undefined') {
  module.exports = Object.assign(feathers, module.exports);
}
