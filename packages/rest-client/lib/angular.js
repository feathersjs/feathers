const Base = require('./base');

class AngularService extends Base {
  request (options, params) {
    const http = this.connection;
    const Headers = this.options.Headers;

    if (!http || !Headers) {
      throw new Error(`Please pass angular's 'http' (instance) and and object with 'Headers' (class) to feathers-rest`);
    }

    const url = options.url;
    const { connection = {} } = params;
    const headers = new Headers(
      Object.assign(
        { Accept: 'application/json' },
        this.options.headers,
        options.headers,
        connection.headers
      )
    );
    const requestOptions = Object.assign({
      method: options.method,
      body: options.body
    }, connection, { headers });

    return new Promise((resolve, reject) => {
      http.request(url, requestOptions)
        .subscribe(resolve, reject);
    })
      .then(res => res.json())
      .catch(error => {
        const response = error.response || error;

        throw response instanceof Error ? response : (response.json() || response);
      });
  }
}

module.exports = AngularService;
