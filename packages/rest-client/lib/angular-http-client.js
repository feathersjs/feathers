const Base = require('./base');

class AngularHttpService extends Base {
  request (options, params) {
    const httpClient = this.connection;
    const HttpHeaders = this.options.HttpHeaders;

    if (!httpClient || !HttpHeaders) {
      throw new Error(`Please pass angular's 'httpClient' (instance) and and object with 'HttpHeaders' (class) to feathers-rest`);
    }

    const url = options.url;
    const { connection = {} } = params;
    const headers = new HttpHeaders(
      Object.assign(
        { Accept: 'application/json' },
        this.options.headers,
        options.headers,
        connection.headers
      )
    );
    const requestOptions = Object.assign({
      // method: options.method,
      body: options.body
    }, params.connection, { headers });

    return new Promise((resolve, reject) => {
      httpClient.request(options.method, url, requestOptions)
        .subscribe(resolve, reject);
    })
      .catch(error => {
        const e = error.error;

        if (e) {
          throw (typeof e === 'string' ? JSON.parse(e) : e);
        }

        throw error;
      });
  }
}

module.exports = AngularHttpService;
