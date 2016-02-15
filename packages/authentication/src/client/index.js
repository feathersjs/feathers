import hooks from './hooks';
import utils from './utils';

const defaults = {
  usernameField: 'email',
  passwordField: 'password',
  userEndpoint: '/users',
  localEndpoint: '/auth/local',
  tokenEndpoint: '/auth/token'
};

export default function(options = {}) {
  const authOptions = Object.assign({}, defaults, options);

  return function() {
    const app = this;

    app.authenticate = function(options) {
      if (!options.type) {
        throw new Error('You need to provide a `type` attribute when calling app.authenticate()');
      }

      let endPoint;

      if (options.type === 'local') {
        endPoint = authOptions.localEndpoint;
      } else if (options.type === 'token') {
        endPoint = authOptions.tokenEndpoint;
      }
      else {
        throw new Error(`Unsupported authentication 'type': ${options.type}`);
      }

      return new Promise(function(resolve, reject){
        // TODO (EK): Handle OAuth logins

        // If we are using a REST client
        if (app.rest) {
          return app.service(endPoint).create(options).then(response => {
            utils.setToken(response.token);
            utils.setUser(response.data);

            return resolve(response);
          }).catch(reject);
        }

        if (app.io || app.primus) {
          const transport = app.io ? 'io' : 'primus';

          app[transport].on('unauthorized', function(error) {
            // console.error('Unauthorized', error);
            return reject(error);
          });

          app[transport].on('authenticated', function (response) {
            // console.log('authenticated', response);
            utils.setToken(response.token);
            utils.setUser(response.data);

            return resolve(response);
          });
        }

        // If we are using socket.io
        if (app.io) {
          // If we aren't already connected then throw an error
          if (!app.io.connected) {
            throw new Error('Socket not connected');
          }

          app.io.on('disconnect', function(error) {
            // console.error('Socket disconnected', error);
            return reject(error);
          });

          app.io.emit('authenticate', options);
        }

        // If we are using primus
        if (app.primus) {
          // If we aren't already connected then throw an error
          if (app.primus.readyState !== 3) {
            throw new Error('Socket not connected');
          }

          app.primus.on('close', function(error) {
            console.error('Socket disconnected', error);
            return reject(error);
          });

          app.primus.send('authenticate', options);
        }
      });
    };

    app.user = function() {
      return utils.getUser();
    };

    app.logout = function() {
      // remove user and token from localstorage
      // on React native it's async storage
      utils.clearToken();
      utils.clearUser();
    };

    // Set up hook that adds adds token to data sent to server over sockets
    app.mixins.push(function(service) {
      service.before(hooks.populateParams());
    });

    // Set up hook that adds authorization header
    if (app.rest) {
      app.mixins.push(function(service) {
        service.before(hooks.populateHeader());
      });
    }

  };
}
