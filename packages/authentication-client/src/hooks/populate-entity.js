/*
 * Fetch and populate an entity by id encoded in the
 * access token payload. Useful for easily getting the
 * current user after authentication, or any other entity.
 */

export default function populateEntity (options = {}) {
  if (!options.service) {
    throw new Error(`You need to pass 'options.service' to the populateEntity() hook.`);
  }

  if (!options.field) {
    throw new Error(`You need to pass 'options.field' to the populateEntity() hook.`);
  }

  if (!options.entity) {
    throw new Error(`You need to pass 'options.entity' to the populateEntity() hook.`);
  }

  return function (hook) {
    const app = hook.app;

    if (hook.type !== 'after') {
      return Promise.reject(new Error(`The 'populateEntity' hook should only be used as an 'after' hook.`));
    }

    return app.passport
      .verifyJWT(hook.result.accessToken)
      .then(payload => {
        const id = payload[options.field];

        if (!id) {
          return Promise.reject(new Error(`Access token payload is missing the '${options.field}' field.`));
        }

        return app.service(options.service).get(id);
      })
      .then(entity => {
        hook.result[options.entity] = entity;
        app.set(options.entity, entity);

        return Promise.resolve(hook);
      });
  };
}
