const { NotAuthenticated } = require('@feathersjs/errors');

const firstResult = exports.firstResult = {
  user: 'Dave'
};
const secondResult = exports.secondResult = {
  user: 'V2'
};

exports.Strategy1 = class Strategy1 {
  authenticate (params) {
    if (params.username === 'David' || params.both) {
      return Promise.resolve(firstResult);
    }

    return Promise.reject(new NotAuthenticated('Invalid Dave'));
  }

  parse (req) {
    if (req.isDave) {
      return Promise.resolve(firstResult);
    }

    return Promise.resolve(null);
  }
};

exports.Strategy2 = class Strategy2 {
  authenticate (params) {
    const isV2 = params.v2 === true && params.password === 'supersecret';
    
    if (isV2 || params.both) {
      return Promise.resolve(secondResult);
    }

    return Promise.reject(new NotAuthenticated('Invalid v2 user'));
  }

  parse (req) {
    if (req.isV2) {
      return Promise.resolve(secondResult);
    }

    return Promise.resolve(null);
  }
};
