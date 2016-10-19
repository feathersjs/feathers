// import errors from 'feathers-errors';
import makeDebug from 'debug';

const debug = makeDebug('feathers-authentication-oauth2');

export default function init () {
  debug('Initializing feathers-authentication-oauth2 plugin');

  return 'feathers-authentication-oauth2';
}
