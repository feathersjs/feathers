import passport from 'passport';
import authenticate from '../../src/passport/authenticate';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import MockStrategy from '../fixtures/strategy';

chai.use(sinonChai);

describe('passport:authenticate', () => {
  it('it returns a function', () => {
    expect(typeof authenticate()).to.equal('function');
  });

  describe('when authenticating with a single strategy', () => {
    let authenticator;
    let verifier;
    let data;
    let req;

    beforeEach(() => {
      req = {
        body: {},
        headers: {},
        session: {},
        cookies: {}
      };
    });

    it.skip('returns an error when passport strategy is not registered', () => {
      const authenticator = authenticate()(passport, 'mock');
      return authenticator().catch(error => {
        expect(error).to.not.equal(undefined);
      });
    });

    it('calls authenticate for a given strategy', () => {
      verifier = (cb) => cb(null, {});
      const strategyOptions = { assignProperty: 'organization' };
      const strategy = new MockStrategy({}, verifier);

      sinon.spy(strategy, 'authenticate');

      passport.use(strategy);
      authenticator = authenticate()(passport, 'mock', strategyOptions);

      return authenticator(req).then(result => {
        expect(strategy.authenticate).to.have.been.calledWith(req, strategyOptions);
        strategy.authenticate.restore();
      });
    });

    describe('passport strategy methods', () => {
      describe('redirect', () => {
        beforeEach(() => {
          data = {
            url: 'http://feathersjs.com',
            status: 301
          };

          verifier = (cb) => cb(null, null, data);
          passport.use(new MockStrategy({}, verifier));
          authenticator = authenticate()(passport, 'mock');
        });

        it('sets redirect true', () => {
          return authenticator(req).then(result => {
            expect(result.redirect).to.equal(true);
          });
        });

        it('sets the redirect url', () => {
          return authenticator(req).then(result => {
            expect(result.url).to.equal(data.url);
          });
        });

        it('sets the status default code', () => {
          return authenticator(req).then(result => {
            expect(result.status).to.equal(data.status);
          });
        });

        it('sets the default status code', () => {
          data = {
            url: 'http://feathersjs.com'
          };

          verifier = (cb) => cb(null, null, data);
          passport.use(new MockStrategy({}, verifier));
          authenticator = authenticate()(passport, 'mock');

          return authenticator(req).then(result => {
            expect(result.status).to.equal(302);
          });
        });
      });

      describe('fail', () => {
        beforeEach(() => {
          data = {
            challenge: 'Missing credentials',
            status: 400
          };

          verifier = (cb) => cb(null, null, data);
          passport.use(new MockStrategy({}, verifier));
          authenticator = authenticate()(passport, 'mock');
        });

        it('sets fail true', () => {
          return authenticator(req).then(result => {
            expect(result.fail).to.equal(true);
          });
        });

        it('sets the challenge', () => {
          return authenticator(req).then(result => {
            expect(result.challenge).to.equal(data.challenge);
          });
        });

        it('sets status', () => {
          return authenticator(req).then(result => {
            expect(result.status).to.equal(data.status);
          });
        });
      });

      describe('error', () => {
        it('returns the error', () => {
          const err = new Error('Authentication Failed');
          verifier = (cb) => cb(err, null);
          passport.use(new MockStrategy({}, verifier));
          authenticator = authenticate()(passport, 'mock');

          return authenticator(req).catch(error => {
            expect(error).to.equal(err);
          });
        });
      });

      describe('success', () => {
        let payload;
        let user;
        let organization;

        beforeEach(() => {
          payload = { platform: 'feathers' };
          user = { name: 'Bob' };
          organization = { name: 'Apple' };
          verifier = (cb) => cb(null, user, payload);
          passport.use(new MockStrategy({}, verifier));
          authenticator = authenticate({ entity: 'user' })(passport, 'mock');
        });

        it('sets success true', () => {
          return authenticator(req).then(result => {
            expect(result.success).to.equal(true);
          });
        });

        it('namespaces passport strategy data to "user"', () => {
          return authenticator(req).then(result => {
            expect(result.data.user).to.deep.equal(user);
          });
        });

        it('returns the passport payload', () => {
          return authenticator(req).then(result => {
            expect(result.data.payload).to.deep.equal(payload);
          });
        });

        it('supports custom namespaces via passports assignProperty', () => {
          verifier = (cb) => cb(null, organization);
          passport.use(new MockStrategy({}, verifier));
          authenticator = authenticate()(passport, 'mock', { assignProperty: 'organization' });

          return authenticator(req).then(result => {
            expect(result.data.organization).to.deep.equal(organization);
          });
        });

        it('supports custom namespaces via strategy options', () => {
          verifier = (cb) => cb(null, organization);
          passport.use(new MockStrategy({}, verifier));
          authenticator = authenticate()(passport, 'mock', { entity: 'organization' });

          return authenticator(req).then(result => {
            expect(result.data.organization).to.deep.equal(organization);
          });
        });
      });

      describe('pass', () => {
        it('does nothing', () => {
          verifier = (cb) => cb(null, null, { pass: true });
          passport.use(new MockStrategy({}, verifier));
          authenticator = authenticate()(passport, 'mock');

          return authenticator(req).then(result => {
            expect(result).to.equal(undefined);
          });
        });
      });
    });
  });

  describe.skip('when authenticating with multiple chained strategies', () => {
    it('calls authenticate for a each strategy', () => {
      // TODO (EK)
    });

    it('returns an error if all strategies fail', () => {
      // TODO (EK)
    });

    it('succeeds if at least one strategy succeeds', () => {
      // TODO (EK)
    });
  });
});
