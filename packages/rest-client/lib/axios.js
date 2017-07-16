const Base = require('./base');

class AxiosService extends Base {
  request (options) {
    const config = {
      url: options.url,
      method: options.method,
      data: options.body,
      headers: Object.assign({
        Accept: 'application/json'
      }, this.options.headers, options.headers)
    };

    return this.connection.request(config)
      .then(res => res.data)
      .catch(error => {
        const response = error.response || error;

        throw response instanceof Error ? response : (response.data || response);
      });
  }
}

module.exports = AxiosService;
