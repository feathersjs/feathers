import getOptions from '../src/options';
import { expect } from 'chai';

describe('options', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../lib/options')).to.equal('function');
  });

  it('is ES6 compatible', () => {
    expect(typeof getOptions).to.equal('function');
  });

  describe('default options', () => {
    let options;

    before(() => {
      options = getOptions();
    });

    it('sets the service path', () => {
      expect(options.path).to.equal('/authentication');
    });

    it('sets the header', () => {
      expect(options.header).to.equal('Authorization');
    });

    it('sets the entity to add to the req, socket, and hook.params', () => {
      expect(options.entity).to.equal('user');
    });

    it('sets the service to lookup the entity', () => {
      expect(options.service).to.equal('users');
    });

    it('sets passReqToCallback', () => {
      expect(options.passReqToCallback).to.equal(true);
    });

    it('disables sessions', () => {
      expect(options.session).to.equal(false);
    });

    describe('cookie', () => {
      it('it is disabled', () => {
        expect(options.cookie.enabled).to.equal(false);
      });

      it('sets the name to feathers-jwt', () => {
        expect(options.cookie.name).to.equal('feathers-jwt');
      });

      it('makes the cookie as httpOnly', () => {
        expect(options.cookie.httpOnly).to.equal(false);
      });

      it('sets the maxAge', () => {
        expect(options.cookie.maxAge).to.equal(undefined);
      });

      it('sets the cookie as secure', () => {
        expect(options.cookie.secure).to.equal(true);
      });
    });

    describe('jwt', () => {
      it('sets the header', () => {
        expect(options.jwt.header).to.deep.equal({ typ: 'access' });
      });

      it('sets the audience', () => {
        expect(options.jwt.audience).to.equal('https://yourdomain.com');
      });

      it('sets the subject', () => {
        expect(options.jwt.subject).to.equal('anonymous');
      });

      it('sets the issuer', () => {
        expect(options.jwt.issuer).to.equal('feathers');
      });

      it('sets the algorithm', () => {
        expect(options.jwt.algorithm).to.equal('HS256');
      });

      it('sets the expiresIn', () => {
        expect(options.jwt.expiresIn).to.equal('1d');
      });
    });
  });

  describe('when custom options are passed', () => {
    it('can add new options', () => {
      let options = getOptions({ custom: 'custom option' });
      expect(options.custom).to.equal('custom option');
    });

    it('can override existing options', () => {
      let options = getOptions({ header: 'X-Authorization' });
      expect(options.header).to.equal('X-Authorization');
    });
  });
});
