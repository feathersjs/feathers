import Debug from 'debug';
import errors from 'feathers-errors';

const debug = Debug('feathers-authentication:middleware');
const FIVE_SECONDS = 5000;
const TEN_HOURS = 36000;
const defaults = {
  timeout: FIVE_SECONDS,
  tokenEndpoint: '/auth/token',
  localEndpoint: '/auth/local'
};

// Usually this is a big no no but passport requires the 
// request object to inspect req.body and req.query so we
// need to miss behave a bit. Don't do this in your own code!
export let exposeConnectMiddleware = function(req, res, next) {
  req.feathers.req = req;
  req.feathers.res = res;
  next();
};

// Make the authenticated passport user also available for REST services.
// We might need this for when we have session supported auth.
// export let exposeAuthenticatedUser = function(options = {}) {
//   return function(req, res, next) {
//     req.feathers.user = req.user;
//     next();
//   };
// };

// Make sure than an auth token passed in is available for hooks
// and services. This gracefully falls back from
// header -> cookie -> body -> query string
export let normalizeAuthToken = function(options = {}) {
  const defaults = {
    header: 'authorization',
    cookie: 'feathers-jwt'
  };

  options = Object.assign({}, defaults, options);

  return function(req, res, next) {
    let token = req.headers[options.header];
    
    // Check the header for the token (preferred method)
    if (token) {
      // if the value contains "bearer" or "Bearer" then cut that part out
      if ( /bearer/i.test(token) ) {
        token = token.split(' ')[1];
      }
    }

    // If we don't already have token in the header check for a cookie
    if (!token && req.cookies && req.cookies[options.cookie]) {
      token = req.cookies[options.cookie];
    }
    // Check the body next if we still don't have a token
    else if (req.body.token) {
      token = req.body.token;
      delete req.body.token;
    }
    // Finally, check the query string. (worst method)
    else if (req.query.token) {
      token = req.query.token;
      delete req.query.token;
    }

    // Tack it on to our feathers object so that it is passed to services
    req.feathers.token = token;

    next();
  };
};

export let successfulLogin = function(options = {}) {
  return function(req, res, next) {
    // NOTE (EK): If we are not dealing with a browser or it was an
    // XHR request then just skip this. This is primarily for
    // handling the oauth redirects and for us to securely send the
    // JWT to the client.
    if (req.xhr || !req.accepts('html')) {
      return next();
    }

    // clear any previous JWT cookie
    res.clearCookie('feathers-jwt');

    // Set a our JWT in a cookie.
    // TODO (EK): Look into hardening this cookie a bit.
    let expiration = new Date();
    expiration.setTime(expiration.getTime() + TEN_HOURS);

    res.cookie('feathers-jwt', res.data.token, { expires: expiration});

    // Redirect to our success route
    res.redirect(options.successRedirect);
  };
};

export let setupSocketIOAuthentication = function(app, options = {}) {
  options = Object.assign({}, defaults, options);
  
  debug('Setting up Socket.io authentication middleware with options:', options);

  return function(socket) {
    let errorHandler = function(error) {
      socket.emit('unauthorized', error, function(){
        // TODO (EK): Maybe we support disconnecting the socket
        // if a certain number of authorization attempts have failed
        // for brute force protection
        // socket.disconnect('unauthorized');
      });

      throw error;
    };

    // Expose the request object to services and hooks
    // for Passport. This is normally a big no no.
    socket.feathers.req = socket.request;

    socket.on('authenticate', function(data) {
      // Authenticate the user using token strategy
      if (data.token) {
        if (typeof data.token !== 'string') {
          return errorHandler(new errors.BadRequest('Invalid token data type.'));
        }

        // The token gets normalized in hook.params for REST so we'll stay with
        // convention and pass it as params using sockets.
        app.service(options.tokenEndpoint).create({}, data).then(response => {
          socket.feathers.token = response.token;
          socket.feathers.user = response.data;
          socket.emit('authenticated', response);
        }).catch(errorHandler);
      }
      // Authenticate the user using local auth strategy
      else {
        // Put our data in a fake req.body object to get local auth
        // with Passport to work because it checks res.body for the 
        // username and password.
        let params = {
          req: socket.request
        };

        params.req.body = data;

        app.service(options.localEndpoint).create(data, params).then(response => {
          socket.feathers.token = response.token;
          socket.feathers.user = response.data;
          socket.emit('authenticated', response);
        }).catch(errorHandler);
      }
    });
  };
};

// TODO (EK): DRY this up along with the code in setupSocketIOAuthentication
export let setupPrimusAuthentication = function(app, options = {}) {
  options = Object.assign({}, defaults, options);

  debug('Setting up Primus authentication middleware with options:', options);

  return function(socket) {
    let errorHandler = function(error) {
      socket.send('unauthorized', error);
      // TODO (EK): Maybe we support disconnecting the socket
      // if a certain number of authorization attempts have failed
      // for brute force protection
      // socket.end('unauthorized', error);
      throw error;
    };

    socket.request.feathers.req = socket.request;

    socket.on('authenticate', function(data) {
      // Authenticate the user using token strategy
      if (data.token) {
        if (typeof data.token !== 'string') {
          return errorHandler(new errors.BadRequest('Invalid token data type.'));
        }

        // The token gets normalized in hook.params for REST so we'll stay with
        // convention and pass it as params using sockets.
        app.service(options.tokenEndpoint).create({}, data).then(response => {
          socket.request.feathers.token = response.token;
          socket.request.feathers.user = response.data;
          socket.send('authenticated', response);
        }).catch(errorHandler);
      }
      // Authenticate the user using local auth strategy
      else {
        // Put our data in a fake req.body object to get local auth
        // with Passport to work because it checks res.body for the 
        // username and password.
        let params = {
          req: socket.request
        };

        params.req.body = data;

        app.service(options.localEndpoint).create(data, params).then(response => {
          socket.request.feathers.token = response.token;
          socket.request.feathers.user = response.data;
          socket.send('authenticated', response);
        }).catch(errorHandler);
      }
    });
  };
};

export default {
  exposeConnectMiddleware,
  normalizeAuthToken,
  successfulLogin,
  setupSocketIOAuthentication,
  setupPrimusAuthentication
};