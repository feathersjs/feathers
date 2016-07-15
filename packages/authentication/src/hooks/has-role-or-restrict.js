import errors from 'feathers-errors';
import isPlainObject from 'lodash.isplainobject';

const defaults = {
  fieldName: 'roles',
  idField: '_id',
  ownerField: 'userId',
  owner: false
};

export default function(options = {}){
  if (!options.roles || !options.roles.length) {
    throw new Error(`You need to provide an array of 'roles' to check against.`);
  }

  return function(hook) {
    if (hook.type !== 'before') {
      throw new Error(`The 'hasRoleOrRestrict' hook should only be used as a 'before' hook.`);
    }

    if (hook.method !== 'find' && hook.method !== 'get') {
      throw new Error(`'hasRoleOrRestrict' should only be used in a find or get hook.`);
    }

    // If it was an internal call then skip this hook
    if (!hook.params.provider) {
      return hook;
    }

    if(hook.result) {
      return hook;
    }

    options = Object.assign({}, defaults, hook.app.get('auth'), options);

    // If we don't have a user we have to always use find instead of get because we must not return id queries that are unrestricted and we don't want the developer to have to add after hooks.
    let query = Object.assign({}, hook.params.query, options.restrict);

    if(hook.id !== null && hook.id !== undefined) {
      const id = {};
      id[options.idField] = hook.id;
      query = Object.assign(query, id);
    }

    // Set provider as undefined so we avoid an infinite loop if this hook is
    // set on the resource we are requesting.
    const params = Object.assign({}, hook.params, { provider: undefined });

    if (!hook.params.user) {
      if(hook.result) {
        return hook;
      }

      return this.find({ query }, params).then(results => {
        if(hook.method === 'get' && Array.isArray(results) && results.length === 1) {
          hook.result = results[0];
          return hook;
        } else {
          hook.result = results;
          return hook;
        }
      }).catch(() => {
        throw new errors.NotFound(`No record found`);
      });
    }

    let authorized = false;
    let roles = hook.params.user[options.fieldName];
    const id = hook.params.user[options.idField];
    const error = new errors.Forbidden('You do not have valid permissions to access this.');

    if (id === undefined) {
      throw new Error(`'${options.idField} is missing from current user.'`);
    }

    // If the user doesn't even have a `fieldName` field and we're not checking
    // to see if they own the requested resource return Forbidden error
    if (!options.owner && roles === undefined) {
      throw error;
    }

    // If the roles is not an array, normalize it
    if (!Array.isArray(roles)) {
      roles = [roles];
    }

    // Iterate through all the roles the user may have and check
    // to see if any one of them is in the list of permitted roles.
    authorized = roles.some(role => options.roles.indexOf(role) !== -1);

    // If we should allow users that own the resource and they don't already have
    // the permitted roles check to see if they are the owner of the requested resource
    if (options.owner && !authorized) {
      if (!hook.id) {
        throw new errors.MethodNotAllowed(`The 'hasRoleOrRestrict' hook should only be used on the 'get', 'update', 'patch' and 'remove' service methods if you are using the 'owner' field.`);
      }

      // look up the document and throw a Forbidden error if the user is not an owner
      return new Promise((resolve, reject) => {
        // Set provider as undefined so we avoid an infinite loop if this hook is
        // set on the resource we are requesting.
        const params = Object.assign({}, hook.params, { provider: undefined });

        this.get(hook.id, params).then(data => {
          if (data.toJSON) {
            data = data.toJSON();
          }
          else if (data.toObject) {
            data = data.toObject();
          }

          let field = data[options.ownerField];

          // Handle nested Sequelize or Mongoose models
          if (isPlainObject(field)) {
            field = field[options.idField];
          }

          if ( field === undefined || field.toString() !== id.toString() ) {
            reject(new errors.Forbidden('You do not have the permissions to access this.'));
          }

          resolve(hook);
        }).catch(reject);
      });
    }

    if (!authorized) {
      if(hook.result) {
        return hook;
      }

      return this.find({ query }, params).then(results => {
        if(hook.method === 'get' && Array.isArray(results) && results.length === 1) {
          hook.result = results[0];
          return hook;
        } else {
          hook.result = results;
          return hook;
        }
      }).catch(() => {
        throw new errors.NotFound(`No record found`);
      });
    }
  };
}
