import Debug from 'debug';
import localAuthHook from './local-auth';

const debug = Debug('feathers-authentication-local');

export default function init(options = {}) {
  return function localAuth() {
    const app = this;

    if(!app.authentication) {
      throw new Error(`Can not find app.authentication. Did you initialize feathers-authentication before feathers-authentication-local?`);
    }

    const authSettings = app.authentication.options;
    const defaults = {
      comparePassword(user, password) {
        const field = this.options.user.passwordField;
        const hash = user[field];

        if (!hash) {
          return Promise.reject(new Error(`User record in the database is missing a '${field}'`));
        }

        debug('Verifying password');

        return new Promise((resolve, reject) => {
          bcrypt.compare(password, hash, function(error, result) {
            // Handle 500 server error.
            if (error) {
              return reject(error);
            }

            if (!result) {
              return reject(false);
            }

            debug('Password correct');
            return resolve(user);
          });
        });
      },

      getFirstUser(users) {
        // Paginated services return the array of results in the data attribute.
        let user = users[0] || users.data && users.data[0];

        // Handle bad username.
        if (!user) {
          return Promise.reject(false);
        }

        debug('User found');
        return Promise.resolve(user);
      }
    };

    authSettings.local = options;

    app.service(options.service).before({
      create(hook) {
        if(hook.username && hook.password) {
          hook.params.authentication = 'local';
          // auth here
        }
      }
    });
  };
}
