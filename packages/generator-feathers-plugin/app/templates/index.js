import errors from 'feathers-errors';
import makeDebug from 'debug';

const debug = makeDebug('<%= name %>');

export default function init () {
  debug('Initializing <%= name %> plugin');

  if (error) {
    throw new errors.GeneralError('There was an error');
  }
  
  return '<%= name %>';
}
