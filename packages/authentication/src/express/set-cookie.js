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
    // Prevent mutating authOptions object
    const options = Object.assign({}, authOptions.cookie);

    debug('Running setCookie middleware with options:', options);

    // If cookies are enabled then set it with its options.
    if (options.enabled && options.name) {
      const cookie = options.name;

      // Don't set the cookie if this was called after removing the token.
      if (res.hook && res.hook.method === 'remove') {
        return next();
      }
      // Only set the cookie if we have a JWT access token.
      if (res.data && res.data.accessToken) {
        // Clear out any old cookie since we are creating a new one
        debug(`Clearing old '${cookie}' cookie`);
        res.clearCookie(cookie);

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
