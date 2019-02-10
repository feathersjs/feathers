const { NotAuthenticated } = require('@feathersjs/errors');

exports.Strategy1 = class Strategy1 {
  setName (name) {
    this.name = name;
  }

  setApplication (app) {
    this.app = app;
  }

  setAuthentication (authentication) {
    this.authentication = authentication;
  }

  authenticate (authentication) {
    if (authentication.username === 'David' || authentication.both) {
      return Promise.resolve(Strategy1.result);
    }

    return Promise.reject(new NotAuthenticated('Invalid Dave'));
  }

  parse (req) {
    if (req.isDave) {
      return Promise.resolve(Strategy1.result);
    }

    return Promise.resolve(null);
  }
};

exports.Strategy1.result = {
  user: {
    id: 123,
    name: 'Dave'
  }
};

exports.Strategy2 = class Strategy2 {
  authenticate (authentication, params) {
    const isV2 = authentication.v2 === true && authentication.password === 'supersecret';

    if (isV2 || authentication.both) {
      return Promise.resolve(Object.assign({}, Strategy2.result, params));
    }

    return Promise.reject(new NotAuthenticated('Invalid v2 user'));
  }

  parse (req) {
    if (req.isV2) {
      return Promise.resolve(Strategy2.result);
    }

    return Promise.resolve(null);
  }
};

exports.Strategy2.result = {
  user: {
    name: 'V2',
    version: 2
  }
};
