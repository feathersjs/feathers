import makeDebug from 'debug';

const debug = makeDebug('feathers-primus');

export default function() {
  return function() {
    debug('Initializing feathers-primus plugin');
  };
}
