const Errors = require('@feathersjs/errors');

/**
   * HTTP handler return response in case of error
   * @param {Error} error
   * @param {import("http").IncomingMessage} req
   * @param {import("http").ServerResponse} res
   */
function errorHandler(error, req, res) {

  // If error in not FeathersError, change it Gerneral FeathersError
  if (error.type !== 'FeathersError') {
    let originalError = error;
    error = new Errors.GeneralError(originalError.message, {
      errors: originalError.errors
    });

    if (originalError.stack) {
      error.stack = originalError.stack;
    }
  }

  // Remove stack if error is 404
  if (error.code === 404) {
    error.stack = null;
  }

  // Perpare status code
  let statusCode = 500;
  if (error.code && Number.isInteger(error.code)) {
    statusCode = error.code;
  }

  // Prepare error message
  let output = Object.assign({}, error.toJSON());
  if (process.env.NODE_ENV === 'production') {
    delete output.stack;
  }

  // Prepare headers
  const headers = {
    'Content-Type': 'application/json'
  };

  // Write response
  res.writeHead(statusCode, headers);
  res.write(JSON.stringify(output));
  res.end();
}

module.exports = errorHandler;
