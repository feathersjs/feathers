const Base = require('./base');

class RequestService extends Base {
  request (options) {
    return new Promise((resolve, reject) => {
      this.connection(Object.assign({
        json: true
      }, options), function (error, res, data) {
        if (error) {
          return reject(error);
        }

        if (!error && res.statusCode >= 400) {
          if (typeof data === 'string') {
            return reject(new Error(data));
          }

          data.response = res;

          return reject(Object.assign(new Error(data.message), data));
        }

        resolve(data);
      });
    });
  }
}

module.exports = RequestService;
