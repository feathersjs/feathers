import errors from 'feathers-errors';
import makeDebug from 'debug';

const debug = makeDebug('<%= name %>');

export default function init () {
  debug('Initializing <%= name %> plugin');
  return '<%= name %>';
}
