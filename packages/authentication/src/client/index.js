import * as hooks from './hooks';

const defaults = {
  storage: '/storage',
  localEndpoint: '/auth/local',
  tokenEndpoint: '/auth/token'
};

export default function(opts = {}) {
  const authOptions = Object.assign({}, defaults, opts);

  return function() {
    const app = this;
    const storage = () => app.service(authOptions.storage);
    
    if (!storage) {
      throw new Error(`You need register a local store before you can use feathers-authentication. Did you call app.use('storage', localstorage())`);
    }

    const handleResponse = function (response) {
      return storage().create([{
        id: 'token',
        value: response.token
      }, {
        id: 'user',
        value: response.data
      }]).then(() => response);
    };

    app.authenticate = function(options) {
      if (!options.type) {
        throw new Error('You need to provide a `type` attribute when calling app.authenticate()');
      }

      let endPoint;

      if (options.type === 'local') {
        endPoint = authOptions.localEndpoint;
      } else if (options.type === 'token') {
        endPoint = authOptions.tokenEndpoint;
      } else {
        throw new Error(`Unsupported authentication 'type': ${options.type}`);
      }

      return new Promise(function(resolve, reject) {
        // TODO (EK): Handle OAuth logins
        // If we are using a REST client
        if (app.rest) {
          return app.service(endPoint).create(options).then(handleResponse);
        }
        
        if (app.io || app.primus) {
          const socket = app.io || app.primus;
          const handleUnauthorized = function(error) {
            // Unleak event handlers
            this.off('disconnect', reject);
            this.off('close', reject);
            
            reject(error);
          };
          const handleAuthenticated = function(response) {
            // We need to bind and unbind the event handlers that didn't run
            // so that they don't leak around
            this.off('unauthorized', handleUnauthorized);
            this.off('disconnect', reject);
            this.off('close', reject);
            
            handleResponse(response).then(reponse => resolve(reponse)).catch(error => {
              throw error;
            });
          };
          
          // Also, binding to events that aren't fired (like `close`)
          // for Socket.io doesn't hurt if we unbind once we're done
          socket.once('disconnect', reject);
          socket.once('close', reject);
          socket.once('unauthorized', handleUnauthorized);
          socket.once('authenticated', handleAuthenticated);
        }

        // If we are using socket.io
        if (app.io) {
          const socket = app.io;
          
          // If we aren't already connected then throw an error
          if (!socket.connected) {
            throw new Error('Socket not connected');
          }
          
          socket.emit('authenticate', options);
        }

        // If we are using primus
        if (app.primus) {
          const socket = app.primus;
          
          // If we aren't already connected then throw an error
          if (socket.readyState !== 3) {
            throw new Error('Socket not connected');
          }
          
          socket.send('authenticate', options);
        }
      });
    };

    app.user = function() {
      return storage().get('user').then(data => data.value);
    };
    
    app.token = function() {
      return storage().get('token').then(data => data.value);
    };

    app.logout = function() {
      return storage().remove(null, { id: { $in: ['user', 'token' ] } });
    };

    // Set up hook that adds adds token and user to params so that
    // it they can be accessed by client side hooks and services
    app.mixins.push(function(service) {
      if (!service.before || !service.after) {
        throw new Error(`It looks like feathers-hooks isn't configured. It is required before you configure feathers-authentication.`);
      }
      service.before(hooks.populateParams(authOptions));
    });
    
    // Set up hook that adds authorization header for REST provider
    if (app.rest) {
      app.mixins.push(function(service) {
        if (!service.before || !service.after) {
          throw new Error(`It looks like feathers-hooks isn't configured. It is required before you configure feathers-authentication.`);
        }
        service.before(hooks.populateHeader(authOptions));
      });
    }
  };
}
