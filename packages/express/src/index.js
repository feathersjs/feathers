// import errors from 'feathers-errors';
import makeDebug from 'debug';

const debug = makeDebug('feathers-express');

export default function init () {
  debug('Initializing feathers-express plugin');
  return 'feathers-express';
}
