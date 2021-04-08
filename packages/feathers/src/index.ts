import * as commons from '@feathersjs/commons';

import version from './version';
import { Feathers } from './application';
import { Application } from './declarations';

export function feathers<T = any, S = any> () {
  return new Feathers<T, S>() as Application<T, S>;
}

feathers.setDebug = commons.setDebug;

export { version, commons, Feathers };
export * from './declarations';
export * from './service';
export * from './hooks';

if (typeof module !== 'undefined') {
  module.exports = Object.assign(feathers, module.exports);
}
