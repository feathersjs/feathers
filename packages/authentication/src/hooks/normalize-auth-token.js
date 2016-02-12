export default function() {
  return function(hook) {
    const hasDataToken = hook.data && hook.data.token;
    const hasQueryToken = hook.params.query && hook.params.query.token;

    if (!hook.params.token) {
      if (hasDataToken) {
        hook.params.token = hook.data.token;
      }
      else if (hasQueryToken) {
        hook.params.token = hook.params.query.token;
      }
    }

    if (hasDataToken) {
      delete hook.data.token;
    }
    
    if (hasQueryToken) {
      delete hook.params.query.token;
    }
  };
}