import { setDebug } from './dependencies.ts';
import version from './version.ts';
import { Feathers } from './application.ts';
import { Application } from './declarations.ts';

export function feathers<T = any, S = any> () {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  return new Feathers<T, S>() as Application<T, S>;
}

feathers.setDebug = setDebug;

export { version, Feathers };
export * from './hooks/index.ts';
export * from './declarations.ts';
export * from './service.ts';

if (typeof module !== 'undefined') {
  module.exports = Object.assign(feathers, module.exports);
}
