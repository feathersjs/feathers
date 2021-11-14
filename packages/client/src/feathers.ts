import { feathers } from '@feathersjs/feathers';
import authentication from '@feathersjs/authentication-client';
import rest from '@feathersjs/rest-client';
import socketio from '@feathersjs/socketio-client';

export * from '@feathersjs/feathers';
export * as errors from '@feathersjs/errors';
export { authentication, rest, socketio };
export default feathers;

if (typeof module !== 'undefined') {
  module.exports = Object.assign(feathers, module.exports);
}
