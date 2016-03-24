import errors from 'feathers-errors';

export default function() {
  return function(hook) {
    if (hook.type !== 'before') {
      throw new Error(`The 'restrictToAuthenticated' hook should only be used as a 'before' hook.`);
    }

    if (hook.params.provider && hook.params.user === undefined) {
      throw new errors.NotAuthenticated('You are not authenticated.');
      // TODO (EK): Add debug log to check to see if the user is populated, if the token was verified and warn appropriately
    }
  };
}
