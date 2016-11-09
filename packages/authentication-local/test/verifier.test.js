import feathers from 'feathers';
import authentication from 'feathers-authentication';
import { Verifier, defaults } from '../src';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

describe('Verifier', () => {
  let service;
  let app;
  let options;

  beforeEach(() => {
    options = Object.assign({}, defaults);
    service = { find: sinon.spy() };
    app = feathers();
    app.use('users', service);
  });

  it('is CommonJS compatible', () => {
    expect(typeof require('../lib/verifier')).to.equal('function');
  });

  it('exposes the Verifier class', () => {
    expect(typeof Verifier).to.equal('function');
  });

  describe('constructor', () => {
    it('retains an app reference', () => {
      const verifier = new Verifier(app, options);
      expect(verifier.app).to.deep.equal(app);
    });

    it('sets options', () => {
      const verifier = new Verifier(app, options);
      expect(verifier.options).to.deep.equal(options);
    });

    it('sets service using service path', () => {
      const verifier = new Verifier(app, options);
      expect(verifier.service).to.deep.equal(app.service('users'));
    });

    it('sets a passed in service instance', () => {
      options.service = service;
      const verifier = new Verifier(app, options);
      expect(verifier.service).to.deep.equal(service);
    });

    describe('when service is undefined', () => {
      it('throws an error', () => {
        expect(() => {
          new Verifier(app, {});
        }).to.throw();
      });
    });
  });

  describe.skip('comparePassword', () => {
    let verifier;

    before(() => {
      verifier = new Verifier(app, options);
    });

    describe('when entity is missing password field', () => {
      it('returns an error', () => {
      });
    });

    describe('password comparison fails', () => {
      it('returns an error', () => {
      });
    });

    describe('password comparison succeeds', () => {
      it('returns the entity', () => {
      });
    });
  });

  describe.skip('normalize', () => {
    describe('when entity is missing password field', () => {
      it('returns an error', () => {
      });
    });

    describe('password comparison fails', () => {
      it('returns an error', () => {
      });
    });

    describe('password comparison succeeds', () => {
      it('returns the entity', () => {
      });
    });
  });

  describe.skip('verify', () => {
    it('calls find on the provided service', () => {
    });

    it('calls normalize', () => {
    });

    it('calls comparePassword', () => {
    });

    it('returns the entity', () => {
    });

    it('returns errors', () => {
    });
  });
});
