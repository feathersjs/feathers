// DO NOT MODIFY - generated from packages/feathers/src/index.ts

import { setDebug } from './dependencies.ts';
import version from './version.ts';
import { Feathers } from './application.ts';
import { Application } from './declarations.ts';

export function feathers<T = any, S = any> () {
  return new Feathers<T, S>() as Application<T, S>;
}

feathers.setDebug = setDebug;

export { version, Feathers };
export * from './hooks/index.ts';
export * from './declarations.ts';
export * from './service.ts';


