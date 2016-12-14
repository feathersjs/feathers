import Debug from 'debug';
import omit from 'lodash.omit';
import ms from 'ms';

const debug = Debug('feathers-authentication:middleware:set-cookie');

export default function setCookie (authOptions = {}) {
  debug('Registering setCookie middleware');

  function makeExpiry (timeframe) {
    return new Date(Date.now() + ms(timeframe));
  }

  return function (req, res, next) {
    const app = req.app;
    const options = authOptions.cookie || {};

    debug('Running setCookie middleware with options:', options);

    // NOTE (EK): If we are not dealing with a browser or it was an
    // XHR request then just skip this. This is primarily for
    // handling the oauth redirects and for us to securely send the
    // JWT to the client in a cookie.
    // if (req.xhr || req.is('json') || !req.accepts('html')) {
    //   return next();
    // }

    // If cookies are enabled then set it with its options.
    if (options.enabled && options.name) {
      const cookie = options.name;

      debug(`Clearing old '${cookie}' cookie`);
      res.clearCookie(cookie);

      // Only set the cookie if we weren't removing the token and we
      // have a JWT access token.
      if (!res.hook || (res.hook && res.hook.method !== 'remove') && res.data && res.data.accessToken) {
        // Check HTTPS and cookie status in production.
        if (!req.secure && app.get('env') === 'production' && options.secure) {
          console.warn('WARN: Request isn\'t served through HTTPS: JWT in the cookie is exposed.');
          console.info('If you are behind a proxy (e.g. NGINX) you can:');
          console.info('- trust it: http://expressjs.com/en/guide/behind-proxies.html');
          console.info(`- set cookie['${cookie}'].secure false`);
        }

        // If a custom expiry wasn't passed then set the expiration
        // to be that of the JWT expiration or the maxAge option if provided.
        if (options.expires === undefined) {
          if (options.maxAge) {
            options.expires = makeExpiry(options.maxAge);
          } else if (authOptions.jwt.expiresIn) {
            options.expires = makeExpiry(authOptions.jwt.expiresIn);
          }
        }

        // Ensure that if a custom expiration was passed it is a valid date
        if (options.expires && !(options.expires instanceof Date)) {
          return next(new Error('cookie.expires must be a valid Date object'));
        }

        // remove some of our options that don't apply to express cookie creation
        // as well as the maxAge because we have set an explicit expiry.
        const cookieOptions = omit(options, 'name', 'enabled', 'maxAge');

        debug(`Setting '${cookie}' cookie with options`, cookieOptions);
        res.cookie(cookie, res.data.accessToken, cookieOptions);
      }
    }

    next();
  };
}
