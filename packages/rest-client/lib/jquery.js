const Base = require('./base');

class JQueryService extends Base {
  request (options, params) {
    const { connection = {} } = params;
    const headers = Object.assign({}, options.headers, this.options.headers, connection.headers);
    const opts = Object.assign({
      dataType: options.type || 'json'
    }, connection, options, { headers });

    if (options.body) {
      opts.data = JSON.stringify(options.body);
      opts.contentType = 'application/json';
    }

    delete opts.type;
    delete opts.body;

    return new Promise((resolve, reject) => {
      this.connection.ajax(opts).then(resolve, xhr => {
        let error = xhr.responseText;

        try {
          error = JSON.parse(error);
        } catch (e) {
          error = new Error(xhr.responseText);
        }

        error.xhr = error.response = xhr;

        reject(error);
      });
    });
  }
}

module.exports = JQueryService;
