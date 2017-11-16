/* eslint-disable no-unused-expressions */
const { expect } = require('chai');

const feathers = require('@feathersjs/feathers');
const auth = require('../lib/index');

describe('Feathers Authentication Client', () => {
  let client;

  beforeEach(() => {
    client = feathers()
      .configure(auth());
  });

  it('throws an error if registered twice', () => {
    expect(() => {
      client.configure(auth());
    }).to.throw(Error);
  });

  it('exports default', () => {
    expect(auth.default).to.equal(auth);
  });

  describe('default options', () => {
    it('sets the authorization header', () => {
      expect(client.passport.options.header).to.equal('Authorization');
    });

    it('sets the cookie name', () => {
      expect(client.passport.options.cookie).to.equal('feathers-jwt');
    });

    it('sets the name used for localstorage', () => {
      expect(client.passport.options.storageKey).to.equal('feathers-jwt');
    });

    it('sets the jwtStrategy', () => {
      expect(client.passport.options.jwtStrategy).to.equal('jwt');
    });

    it('sets the auth service path', () => {
      expect(client.passport.options.path).to.equal('/authentication');
    });

    it('sets the entity', () => {
      expect(client.passport.options.entity).to.equal('user');
    });

    it('sets the entity service', () => {
      expect(client.passport.options.service).to.equal('users');
    });
  });
});
