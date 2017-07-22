/* eslint-disable no-unused-expressions */

import feathers from 'feathers';
import hooks from 'feathers-hooks';
import authentication, { express } from '../src';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

describe('/authentication service', () => {
  let app;

  beforeEach(() => {
    sinon.spy(express, 'emitEvents');
    sinon.spy(express, 'setCookie');
    sinon.spy(express, 'successRedirect');
    sinon.spy(express, 'failureRedirect');

    app = feathers()
      .configure(hooks())
      .configure(authentication({ secret: 'supersecret' }));
  });

  afterEach(() => {
    express.emitEvents.restore();
    express.setCookie.restore();
    express.successRedirect.restore();
    express.failureRedirect.restore();
  });

  it('throws an error when path option is missing', () => {
    expect(() => {
      feathers().configure(authentication({
        secret: 'dummy',
        path: null
      }));
    }).to.throw;
  });

  it('registers the service at the path', () => {
    expect(app.service('authentication')).to.not.equal(undefined);
  });

  it('keeps a reference to app', () => {
    expect(app.service('authentication').app).to.not.equal(undefined);
  });

  it('keeps a reference to passport', () => {
    expect(app.service('authentication').passport).to.not.equal(undefined);
  });

  it('registers the emitEvents express middleware', () => {
    expect(express.emitEvents).to.have.been.calledOnce;
  });

  it('registers the setCookie express middleware', () => {
    expect(express.setCookie).to.have.been.calledOnce;
  });

  it('registers the successRedirect express middleware', () => {
    expect(express.successRedirect).to.have.been.calledOnce;
  });

  it('registers the failureRedirect express middleware', () => {
    expect(express.failureRedirect).to.have.been.calledOnce;
  });

  describe('create', () => {
    const data = {
      payload: { id: 1 }
    };

    it('creates an accessToken', () => {
      return app.service('authentication').create(data).then(result => {
        expect(result.accessToken).to.not.equal(undefined);
      });
    });

    it('creates a custom token', () => {
      const params = {
        jwt: {
          header: { typ: 'refresh' },
          expiresIn: '1y'
        }
      };

      return app.service('authentication').create(data, params).then(result => {
        expect(result.accessToken).to.not.equal(undefined);
      });
    });

    it('creates multiple custom tokens without side effect on expiration', () => {
      const params = {
        jwt: {
          header: { typ: 'refresh' },
          expiresIn: '1y'
        }
      };

      return app.service('authentication').create(data, params).then(result => {
        return app.service('authentication').create(data).then(result => {
          return app.passport
            .verifyJWT(result.accessToken, app.get('authentication'))
            .then(payload => {
              const delta = (payload.exp - payload.iat);
              expect(delta).to.equal(24 * 60 * 60);
            });
        });
      });
    });
  });

  describe('remove', () => {
    let accessToken;

    beforeEach(() => {
      return app.passport
        .createJWT({ id: 1 }, app.get('authentication'))
        .then(token => { accessToken = token; });
    });

    it('verifies an accessToken and returns it', () => {
      return app.service('authentication').remove(accessToken).then(response => {
        expect(response).to.deep.equal({ accessToken });
      });
    });

    it('verifies an accessToken in the header', () => {
      const params = { headers: { authorization: accessToken } };
      return app.service('authentication').remove(null, params).then(response => {
        expect(response).to.deep.equal({ accessToken });
      });
    });

    it('verifies an accessToken in the header with Bearer scheme', () => {
      const params = { headers: { authorization: `Bearer ${accessToken}` } };
      return app.service('authentication').remove(null, params).then(response => {
        expect(response).to.deep.equal({ accessToken });
      });
    });
  });
});
