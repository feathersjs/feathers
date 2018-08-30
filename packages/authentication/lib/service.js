const Debug = require('debug');
const merge = require('lodash.merge');
const express = require('./express');

const debug = Debug('@feathersjs/authentication:authentication:service');

class Service {
  constructor (app) {
    this.app = app;
    this.passport = app.passport;
  }

  create (data = {}, params = {}) {
    const defaults = this.app.get('authentication') || this.app.get('auth');
    const payload = params.payload;

    // create accessToken
    // TODO (EK): Support refresh tokens
    // TODO (EK): This should likely be a hook
    // TODO (EK): This service can be datastore backed to support blacklists :)
    return this.passport
      .createJWT(payload, merge({}, defaults, params))
      .then(accessToken => {
        return { accessToken };
      });
  }

  remove (id, params) {
    const defaults = this.app.get('authentication') || this.app.get('auth');
    const authHeader = params.headers && params.headers[defaults.header.toLowerCase()];
    const authParams = authHeader && authHeader.match(/(\S+)\s+(\S+)/);
    const accessToken = id !== null ? id : (authParams && authParams[2]) || authHeader;

    // TODO (EK): return error if token is missing?
    return this.passport
      .verifyJWT(accessToken, merge(defaults, params))
      .then(payload => {
        return { accessToken };
      });
  }
}

module.exports = function init (options) {
  return function () {
    const app = this;
    const path = options.path;
    const {
      successRedirect,
      failureRedirect,
      setCookie,
      emitEvents
    } = express;

    if (typeof path !== 'string') {
      throw new Error(`You must provide a 'path' in your authentication configuration or pass one explicitly.`);
    }

    debug('Configuring authentication service at path', path);

    app.use(
      path,
      new Service(app, options),
      emitEvents(options),
      setCookie(options),
      successRedirect(),
      failureRedirect(options)
    );

    const service = app.service(path);

    if (typeof service.publish === 'function') {
      service.publish(() => false);
    }
  };
};

module.exports.Service = Service;
