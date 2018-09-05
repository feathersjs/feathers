/* eslint-disable no-unused-expressions */
const feathers = require('@feathersjs/feathers');
const expressify = require('@feathersjs/express');
const authentication = require('../lib');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const { expect } = chai;

chai.use(sinonChai);

describe('/authentication service', () => {
  let app;

  beforeEach(() => {
    app = expressify(feathers())
      .configure(authentication({ secret: 'supersecret' }));
  });

  it('throws an error when path option is missing', () => {
    expect(() => {
      expressify(feathers()).configure(authentication({
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
