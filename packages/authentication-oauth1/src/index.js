// import errors from 'feathers-errors';
import makeDebug from 'debug';

const debug = makeDebug('feathers-authentication-oauth1');

export default function init () {
  debug('Initializing feathers-authentication-oauth1 plugin');
  return 'feathers-authentication-oauth1';
}
