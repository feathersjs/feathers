const path = require('path');
const errors = require('./index');

const defaults = {
  public: path.resolve(__dirname, 'public')
};
const defaultError = path.resolve(defaults.public, 'default.html');

module.exports = function (options = {}) {
  options = Object.assign({}, defaults, options);

  if (typeof options.html === 'undefined') {
    options.html = {
      401: path.resolve(options.public, '401.html'),
      404: path.resolve(options.public, '404.html'),
      default: defaultError
    };
  }

  return function (error, req, res, next) {
    if (error.type !== 'FeathersError') {
      let oldError = error;
      error = new errors.GeneralError(oldError.message, {
        errors: oldError.errors
      });

      if (oldError.stack) {
        error.stack = oldError.stack;
      }
    }

    error.code = !isNaN(parseInt(error.code, 10)) ? parseInt(error.code, 10) : 500;
    const formatter = {};

    // If the developer passed a custom function
    if (typeof options.html === 'function') {
      formatter['text/html'] = options.html;
    } else {
      formatter['text/html'] = function () {
        let file = options.html[error.code];

        if (!file) {
          file = options.html.default || defaultError;
        }

        res.set('Content-Type', 'text/html');
        res.sendFile(file);
      };
    }

    // If the developer passed a custom function
    if (typeof options.json === 'function') {
      formatter['application/json'] = options.json;
    } else {
      // Don't show stack trace if it is a 404 error
      if (error.code === 404) {
        error.stack = null;
      }

      formatter['application/json'] = function () {
        let output = Object.assign({}, error.toJSON());

        if (process.env.NODE_ENV === 'production') {
          delete output.stack;
        }

        res.set('Content-Type', 'application/json');
        res.json(output);
      };
    }

    res.status(error.code);

    const contentType = req.headers['content-type'] || '';
    const accepts = req.headers.accept || '';

    // by default just send back json
    if (contentType.indexOf('json') !== -1 || accepts.indexOf('json') !== -1) {
      formatter['application/json'](error, req, res, next);
    } else if (options.html && (contentType.indexOf('html') !== -1 || accepts.indexOf('html') !== -1)) {
      return formatter['text/html'](error, req, res, next);
    } else {
      // TODO (EK): Maybe just return plain text
      formatter['application/json'](error, req, res, next);
    }
  };
};
