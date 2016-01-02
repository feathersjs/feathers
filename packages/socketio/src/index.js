import makeDebug from 'debug';

const debug = makeDebug('feathers-socketio');

export default function() {
  return function() {
    debug('Initializing feathers-socketio plugin');
  };
}
