/* eslint-disable no-unused-expressions */
const feathers = require('@feathersjs/feathers');
const expressify = require('@feathersjs/express');
const passport = require('passport');
const socketio = require('@feathersjs/socketio');
const primus = require('@feathersjs/primus');
const authentication = require('../lib');
const socket = require('../lib/socket');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { expect } = chai;

chai.use(sinonChai);

describe('Feathers Authentication', () => {
  let app;
  let config;

  beforeEach(() => {
    app = expressify(feathers());
    config = { secret: 'supersecret' };
  });

  it('is CommonJS compatible', () => {
    expect(typeof require('../lib')).to.equal('function');
  });

  it('is ES6 compatible', () => {
    expect(typeof authentication).to.equal('function');
  });

  it('exposes default', () => {
    expect(typeof authentication.default).to.equal('function');
  });

  it('exposes hooks', () => {
    expect(typeof authentication.hooks).to.equal('object');
  });

  it('exposes the auth service', () => {
    expect(typeof authentication.service).to.equal('function');
  });

  describe('when secret is missing', () => {
    it('throws an error', () => {
      expect(() => {
        app.configure(authentication());
      }).to.throw;
    });
  });

  describe('authentication has already been registered', () => {
    it('throws an error', () => {
      expect(() => {
        app.configure(authentication(config));
        app.configure(authentication(config));
      }).to.throw;
    });
  });

  describe('when in development mode', () => {
    it('sets cookie to be insecure', () => {
      app.set('env', 'development');
      app.configure(authentication(config));
      expect(app.get('authentication').cookie.secure).to.equal(false);
    });
  });

  describe('when in test mode', () => {
    it('sets cookie to be insecure', () => {
      app.set('env', 'test');
      app.configure(authentication(config));
      expect(app.get('authentication').cookie.secure).to.equal(false);
    });
  });

  describe('when in production mode', () => {
    it('sets cookie to be secure', () => {
      app.set('env', 'production');
      app.configure(authentication(config));
      expect(app.get('authentication').cookie.secure).to.equal(true);
    });
  });

  it('sets custom config options', () => {
    config.custom = 'custom';
    app.configure(authentication(config));
    expect(app.get('authentication').custom).to.equal('custom');
  });

  it('sets up feathers passport adapter', () => {
    app.configure(authentication(config));
    expect(typeof app.passport).to.equal('object');
  });

  it('sets up passport', () => {
    sinon.spy(passport, 'framework');
    app.configure(authentication(config));
    expect(passport.framework).to.have.been.calledOnce;
    passport.framework.restore();
  });

  it('aliases passport.authenticate to app.authenticate', () => {
    app.configure(authentication(config));
    expect(typeof app.authenticate).to.equal('function');
  });

  it('initializes passport', () => {
    sinon.spy(passport, 'initialize');
    app.configure(authentication(config));
    expect(passport.initialize).to.have.been.calledOnce;
    passport.initialize.restore();
  });

  it('registers the authentication service', () => {
    app.configure(authentication(config));
    expect(app.service('authentication')).to.not.equal(undefined);
  });

  describe('when socketio is configured', () => {
    beforeEach(() => {
      sinon.spy(socket, 'socketio');
      app.configure(socketio())
        .configure(authentication(config))
        .listen();
    });

    afterEach(() => {
      socket.socketio.restore();
    });

    it('registers socketio middleware', () => {
      expect(socket.socketio).to.have.been.calledOnce;
    });
  });

  describe('when primus is configured', () => {
    beforeEach(() => {
      sinon.spy(socket, 'primus');
      app.configure(primus())
        .configure(authentication(config))
        .listen();
    });

    afterEach(() => {
      socket.primus.restore();
    });

    it('registers primus middleware', () => {
      expect(socket.primus).to.have.been.calledOnce;
    });
  });
});
