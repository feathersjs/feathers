import Debug from 'debug';
import ms from 'ms';
import { normalizeError } from 'feathers-socket-commons/lib/utils';
import lt from 'long-timeout';
import updateEntity from './update-entity';

const debug = Debug('feathers-authentication:sockets:handler');

function handleSocketCallback (promise, callback) {
  if (typeof callback === 'function') {
    promise.then(data => callback(null, data))
      .catch(error => {
        debug(`Socket authentication error`, error);
        callback(normalizeError(error));
      });
  }

  return promise;
}

export default function setupSocketHandler (app, options, { feathersParams, provider, emit, disconnect }) {
  const authSettings = app.get('authentication') || app.get('auth');
  const service = app.service(authSettings.path);
  const entityService = app.service(authSettings.service);
  let isUpdateEntitySetup = false;

  return function (socket) {
    let logoutTimer;

    const logout = function (callback = () => {}) {
      const connection = feathersParams(socket);
      const { accessToken } = connection;

      if (accessToken) {
        debug('Logging out socket with accessToken', accessToken);

        delete connection.accessToken;
        delete connection.authenticated;
        connection.headers = {};
        socket._feathers.body = {};

        const promise = service.remove(accessToken, { authenticated: true }).then(tokens => {
          debug(`Successfully logged out socket with accessToken`, accessToken);

          app.emit('logout', tokens, {
            provider,
            socket,
            connection
          });

          return tokens;
        });

        handleSocketCallback(promise, callback);
      } else if (typeof callback === 'function') {
        return callback(null, {});
      }
    };

    const authenticate = function (data = {}, callback = () => {}) {
      if (typeof data === 'function') {
        callback = data;
      }

      if (typeof data === 'function' || typeof data !== 'object' || data === null) {
        data = {};
      }

      const { strategy } = data;
      socket._feathers = Object.assign({
        query: {},
        provider: 'socketio',
        headers: {},
        session: {},
        cookies: {}
      }, feathersParams(socket));

      const strategyOptions = app.passport.options(strategy);

      const promise = service.create(data, socket._feathers)
        .then(tokens => {
          if (socket._feathers.authenticated) {
            // Add the auth strategy response data and tokens to the socket connection
            // so that they can be referenced in the future. (ie. attach the user)
            let connection = feathersParams(socket);
            const headers = {
              [authSettings.header]: tokens.accessToken
            };
            let result = {
              payload: socket._feathers.payload,
              [strategyOptions.entity]: socket._feathers[strategyOptions.entity]
            };

            connection = Object.assign(connection, result, tokens, { headers, authenticated: true });

            app.emit('login', tokens, {
              provider,
              socket,
              connection
            });
          }

          // Clear any previous timeout if we have logged in again.
          if (logoutTimer) {
            debug(`Clearing old timeout.`);
            lt.clearTimeout(logoutTimer);
          }

          logoutTimer = lt.setTimeout(() => {
            debug(`Token expired. Logging out.`);
            logout();
          }, ms(authSettings.jwt.expiresIn));

          // TODO (EK): Setup and tear down socket listeners to keep the entity
          // up to date that should be attached to the socket. Need to get the
          // entity or assignProperty
          //
          // Remove old listeners to prevent leaks
          // socket.off('users updated');
          // socket.off('users patched');
          // socket.off('users removed');

          // Register new event listeners
          // socket.on('users updated', data => {
          //   if (data.id === id) {
          //     let connection = feathersParams(socket);
          //     connection.user = data;
          //   }
          // });

          // socket.on('users patched', data => {
          //   if (data.id === id) {
          //     let connection = feathersParams(socket);
          //     connection.user = data;
          //   }
          // });

          // socket.on('users removed', data => {
          //   if (data.id === id) {
          //     logout();
          //   }
          // });

          return Promise.resolve(tokens);
        });

      handleSocketCallback(promise, callback);
    };

    socket.on('authenticate', authenticate);
    socket.on(disconnect, logout);
    socket.on('logout', logout);

    // Only bind the handlers on receiving the first socket connection.
    if (!isUpdateEntitySetup) {
      isUpdateEntitySetup = true;
      entityService.on('updated', updateEntity(app));
      entityService.on('patched', updateEntity(app));
    }
  };
}
