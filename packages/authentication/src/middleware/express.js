import Debug from 'debug';

const debug = Debug('feathers-authentication:middleware');
const THIRTY_SECONDS = 30000;

// Usually this is a big no no but passport requires the
// request object to inspect req.body and req.query so we
// need to miss behave a bit. Don't do this in your own code!
export function exposeConnectMiddleware(req, res, next) {
  req.feathers.req = req;
  req.feathers.res = res;
  next();
}

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
// header -> body -> query string
export function normalizeAuthToken(options = {}) {
  debug('Setting up normalizeAuthToken middleware with options:', options);

  if (!options.header) {
    throw new Error(`'header' must be provided to normalizeAuthToken() middleware`);
  }

  return function(req, res, next) {
    // Normalize header capitalization the same way Node.js does
    let token = req.headers[options.header.toLowerCase()];

    // Check the header for the token (preferred method)
    if (token) {
      // if the value contains "bearer" or "Bearer" then cut that part out
      if ( /bearer/i.test(token) ) {
        token = token.split(' ')[1];
      }
    }

    // Check the body next if we still don't have a token
    if (req.body.token) {
      token = req.body.token;
      delete req.body.token;
    }
    // Finally, check the query string. (worst method but nice for quick local dev)
    else if (req.query.token) {
      token = req.query.token;
      delete req.query.token;
    }

    // Tack it on to our feathers object so that it is passed to services
    req.feathers.token = token;

    next();
  };
}

export function successfulLogin(options = {}) {
  debug('Setting up successfulLogin middleware with options:', options);

  if (options.cookie === undefined) {
    throw new Error(`'cookie' must be provided to successfulLogin() middleware or set to 'false'`);
  }

  return function(req, res, next) {
    // NOTE (EK): If we are not dealing with a browser or it was an
    // XHR request then just skip this. This is primarily for
    // handling the oauth redirects and for us to securely send the
    // JWT to the client in a cookie.
    if (!options.successRedirect || req.xhr || req.is('json') || !req.accepts('html')) {
      return next();
    }

    // If cookies are enabled set our JWT in a cookie.
    if (options.cookie) {
      // clear any previous JWT cookie
      res.clearCookie(options.cookie.name);

      // Check HTTPS and cookie status in production 
      if (!req.secure && process.env.NODE_ENV === 'production' && options.cookie.secure) {
        console.warn('WARN: Request isn\'t served through HTTPS: JWT in the cookie is exposed.');
        console.info('If you are behind a proxy (e.g. NGINX) you can:');
        console.info('- trust it: http://expressjs.com/en/guide/behind-proxies.html');
        console.info('- set cookie.secure false');
      }

      const cookieOptions = Object.assign({}, options.cookie, { path: options.successRedirect });

      // If a custom expiry wasn't passed then set the expiration to be 30 seconds from now.
      if (cookieOptions.expires === undefined) {
        const expiry = new Date();
        expiry.setTime(expiry.getTime() + THIRTY_SECONDS);
        cookieOptions.expires = expiry;
      }

      if ( !(cookieOptions.expires instanceof Date) ) {
        throw new Error('cookie.expires must be a valid Date object');
      }

      res.cookie(options.cookie.name, res.data.token, cookieOptions);
    }

    // Redirect to our success route
    res.redirect(options.successRedirect);
  };
}

export function failedLogin(options = {}) {
  debug('Setting up failedLogin middleware with options:', options);

  if (options.cookie === undefined) {
    throw new Error(`'cookie' must be provided to failedLogin() middleware or set to 'false'`);
  }

  return function(error, req, res, next) {
    // NOTE (EK): If we are not dealing with a browser or it was an
    // XHR request then just skip this. This is primarily for
    // handling redirecting on an oauth failure.
    // console.log('Auth Error', error, options);
    if (!options.failureRedirect || req.xhr || req.is('json') || !req.accepts('html')) {
      return next(error);
    }

    // clear any previous JWT cookie
    if (options.cookie) {
      res.clearCookie(options.cookie.name);
    }

    debug('An authentication error occurred.', error);

    // Redirect to our failure route
    res.redirect(options.failureRedirect);
  };
}
