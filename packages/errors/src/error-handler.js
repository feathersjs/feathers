// jshint unused:false
import path from 'path';
import errors from './index';

const defaults = {
  public: path.resolve(__dirname, 'public')
};
const defaultError = path.resolve(defaults.public, 'default.html');

export default function(options = {}) {
  options = Object.assign({}, defaults, options);
  
  if(typeof options.html === 'undefined') {
    options.html = {
      401: path.resolve(options.public, '401.html'),
      404: path.resolve(options.public, '404.html'),
      default: defaultError
    };
  }

  return function(error, req, res, next) {
    if (error.type !== 'FeathersError') {
      let oldError = error;
      error = new errors.GeneralError(oldError.message, {
        errors: oldError.errors
      });

      if (oldError.stack) {
        error.stack = oldError.stack;
      }
    }

    const code = !isNaN( parseInt(error.code, 10) ) ? parseInt(error.code, 10) : 500;
    const formatter = {};

    if(options.html) {
      formatter['text/html'] = function() {
        let file = options.html[code];
        
        if(!file) {
          file = options.html.default || defaultError;
        }
        
        res.sendFile(file);
      };
    }
    
    formatter['application/json'] = function () {
      let output = Object.assign({}, error.toJSON());

      if (process.env.NODE_ENV === 'production') {
        delete output.stack;
      }

      res.json(output);
    };
    
    // Don't show stack trace if it is a 404 error
    if (code === 404) {
      error.stack = null;
    }

    res.status(code);

    res.format(formatter);
  };
}
