
if(!global._babelPolyfill) { require('babel-polyfill'); }

import makeDebug from 'debug';

const debug = makeDebug('<%= name %>');

export default function() {
  return function() {
    debug('Initializing <%= name %> plugin');
  };
}
