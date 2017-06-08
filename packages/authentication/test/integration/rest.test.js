/* eslint-disable no-unused-expressions */

import merge from 'lodash.merge';
import request from 'superagent';
import createApplication from '../fixtures/server';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

describe('REST authentication', function () {
  const port = 8996;
  const baseURL = `http://localhost:${port}`;
  const app = createApplication({ secret: 'supersecret' });
  let server;
  let expiredToken;
  let accessToken;

  before(done => {
    const options = merge({}, app.get('authentication'), { jwt: { expiresIn: '1ms' } });
    app.passport.createJWT({}, options)
      .then(token => {
        expiredToken = token;
        return app.passport.createJWT({ userId: 0 }, app.get('authentication'));
      })
      .then(token => {
        accessToken = token;
        server = app.listen(port);
        server.once('listening', () => done());
      });
  });

  after(() => server.close());

  describe('Authenticating against auth service', () => {
    describe('Using local strategy', () => {
      let data;

      beforeEach(() => {
        data = {
          strategy: 'local',
          email: 'admin@feathersjs.com',
          password: 'admin'
        };
      });

      describe('when using valid credentials', () => {
        it('returns a valid access token', () => {
          return request
            .post(`${baseURL}/authentication`)
            .send(data)
            .then(response => {
              expect(response.body.accessToken).to.exist;
              return app.passport.verifyJWT(response.body.accessToken, app.get('authentication'));
            }).then(payload => {
              expect(payload).to.exist;
              expect(payload.iss).to.equal('feathers');
              expect(payload.userId).to.equal(0);
            });
        });
      });

      describe('when using invalid credentials', () => {
        it('returns NotAuthenticated error', () => {
          data.password = 'invalid';
          return request
            .post(`${baseURL}/authentication`)
            .send(data)
            .then(response => {
              expect(response).to.not.be.ok; // should not get here
            })
            .catch(error => {
              expect(error.status).to.equal(401);
              expect(error.response.body.name).to.equal('NotAuthenticated');
            });
        });
      });

      describe('when missing credentials', () => {
        it('returns NotAuthenticated error', () => {
          return request
            .post(`${baseURL}/authentication`)
            .send({})
            .then(response => {
              expect(response).to.not.be.ok; // should not get here
            })
            .catch(error => {
              expect(error.status).to.equal(401);
              expect(error.response.body.name).to.equal('NotAuthenticated');
            });
        });
      });
    });

    describe('Using JWT strategy via body', () => {
      let data;

      beforeEach(() => {
        data = { accessToken };
      });

      describe('when using a valid access token', () => {
        it('returns a valid access token', () => {
          return request
            .post(`${baseURL}/authentication`)
            .send(data)
            .then(response => {
              expect(response.body.accessToken).to.exist;
              return app.passport.verifyJWT(response.body.accessToken, app.get('authentication'));
            }).then(payload => {
              expect(payload).to.exist;
              expect(payload.iss).to.equal('feathers');
              expect(payload.userId).to.equal(0);
            });
        });
      });

      describe.skip('when using a valid refresh token', () => {
        it('returns a valid access token', () => {
          return request
            .post(`${baseURL}/authentication`)
            .send(data)
            .then(response => {
              expect(response.body.accessToken).to.exist;
              return app.passport.verifyJWT(response.body.accessToken, app.get('authentication'));
            }).then(payload => {
              expect(payload).to.exist;
              expect(payload.iss).to.equal('feathers');
              expect(payload.userId).to.equal(0);
            });
        });
      });

      describe('when access token is invalid', () => {
        it('returns not authenticated error', () => {
          data.accessToken = 'invalid';
          return request
            .post(`${baseURL}/authentication`)
            .send(data)
            .then(response => {
              expect(response).to.not.be.ok; // should not get here
            })
            .catch(error => {
              expect(error.status).to.equal(401);
              expect(error.response.body.name).to.equal('NotAuthenticated');
            });
        });
      });

      describe('when access token is expired', () => {
        it('returns not authenticated error', () => {
          data.accessToken = expiredToken;
          return request
            .post(`${baseURL}/authentication`)
            .send(data)
            .then(response => {
              expect(response).to.not.be.ok; // should not get here
            })
            .catch(error => {
              expect(error.status).to.equal(401);
              expect(error.response.body.name).to.equal('NotAuthenticated');
            });
        });
      });

      describe('when access token is missing', () => {
        it('returns not authenticated error', () => {
          delete data.accessToken;
          return request
            .post(`${baseURL}/authentication`)
            .send(data)
            .then(response => {
              expect(response).to.not.be.ok; // should not get here
            })
            .catch(error => {
              expect(error.status).to.equal(401);
              expect(error.response.body.name).to.equal('NotAuthenticated');
            });
        });
      });
    });
  });

  describe('when calling a protected service method', () => {
    describe('when header is invalid', () => {
      it('returns not authenticated error', () => {
        return request
          .get(`${baseURL}/users`)
          .set('X-Authorization', accessToken)
          .then(response => {
            expect(response).to.not.be.ok; // should not get here
          })
          .catch(error => {
            expect(error.status).to.equal(401);
            expect(error.response.body.name).to.equal('NotAuthenticated');
          });
      });
    });

    describe('when token is invalid', () => {
      it('returns not authenticated error', () => {
        return request
          .get(`${baseURL}/users`)
          .set('Authorization', 'invalid')
          .then(response => {
            expect(response).to.not.be.ok; // should not get here
          })
          .catch(error => {
            expect(error.status).to.equal(401);
            expect(error.response.body.name).to.equal('NotAuthenticated');
          });
      });
    });

    describe('when token is expired', () => {
      it('returns not authenticated error', () => {
        return request
          .get(`${baseURL}/users`)
          .set('Authorization', expiredToken)
          .then(response => {
            expect(response).to.not.be.ok; // should not get here
          })
          .catch(error => {
            expect(error.status).to.equal(401);
            expect(error.response.body.name).to.equal('NotAuthenticated');
          });
      });
    });

    describe('when token is valid', () => {
      it('returns data', () => {
        return request
          .get(`${baseURL}/users`)
          .set('Authorization', accessToken)
          .then(response => {
            expect(response.body.length).to.equal(1);
            expect(response.body[0].id).to.equal(0);
          });
      });
    });
  });

  describe('when calling an un-protected service method', () => {
    describe('when header is invalid', () => {
      it('returns data', () => {
        return request
          .get(`${baseURL}/users/0`)
          .set('X-Authorization', accessToken)
          .then(response => {
            expect(response.body.id).to.equal(0);
          });
      });
    });
    describe('when token is invalid', () => {
      it('returns data', () => {
        return request
          .get(`${baseURL}/users/0`)
          .set('Authorization', 'invalid')
          .then(response => {
            expect(response.body.id).to.equal(0);
          });
      });
    });

    describe('when token is expired', () => {
      it('returns data', () => {
        return request
          .get(`${baseURL}/users/0`)
          .set('Authorization', expiredToken)
          .then(response => {
            expect(response.body.id).to.equal(0);
          });
      });
    });

    describe('when token is valid', () => {
      it('returns data', () => {
        return request
          .get(`${baseURL}/users/0`)
          .set('Authorization', accessToken)
          .then(response => {
            expect(response.body.id).to.equal(0);
          });
      });
    });
  });

  describe('when calling a protected custom route', () => {
    describe('when header is invalid', () => {
      it('returns not authenticated error', () => {
        return request
          .get(`${baseURL}/protected`)
          .set('Content-Type', 'application/json')
          .set('X-Authorization', accessToken)
          .then(response => {
            expect(response).to.not.be.ok; // should not get here
          })
          .catch(error => {
            expect(error.status).to.equal(401);
            expect(error.response.body.name).to.equal('NotAuthenticated');
          });
      });
    });

    describe('when token is invalid', () => {
      it('returns not authenticated error', () => {
        return request
          .get(`${baseURL}/protected`)
          .set('Content-Type', 'application/json')
          .set('Authorization', 'invalid')
          .then(response => {
            expect(response).to.not.be.ok; // should not get here
          })
          .catch(error => {
            expect(error.status).to.equal(401);
            expect(error.response.body.name).to.equal('NotAuthenticated');
          });
      });
    });

    describe('when token is expired', () => {
      it('returns not authenticated error', () => {
        return request
          .get(`${baseURL}/protected`)
          .set('Content-Type', 'application/json')
          .set('Authorization', expiredToken)
          .then(response => {
            expect(response).to.not.be.ok; // should not get here
          })
          .catch(error => {
            expect(error.status).to.equal(401);
            expect(error.response.body.name).to.equal('NotAuthenticated');
          });
      });
    });

    describe('when token is valid', () => {
      it('returns data', () => {
        return request
          .get(`${baseURL}/protected`)
          .set('Content-Type', 'application/json')
          .set('Authorization', accessToken)
          .then(response => {
            expect(response.body.success).to.equal(true);
          });
      });
    });
  });

  describe('when calling an un-protected custom route', () => {
    describe('when header is invalid', () => {
      it('returns data', () => {
        return request
          .get(`${baseURL}/unprotected`)
          .set('Content-Type', 'application/json')
          .set('X-Authorization', accessToken)
          .then(response => {
            expect(response.body.success).to.equal(true);
          });
      });
    });
    describe('when token is invalid', () => {
      it('returns data', () => {
        return request
          .get(`${baseURL}/unprotected`)
          .set('Content-Type', 'application/json')
          .set('Authorization', 'invalid')
          .then(response => {
            expect(response.body.success).to.equal(true);
          });
      });
    });

    describe('when token is expired', () => {
      it('returns data', () => {
        return request
          .get(`${baseURL}/unprotected`)
          .set('Content-Type', 'application/json')
          .set('Authorization', expiredToken)
          .then(response => {
            expect(response.body.success).to.equal(true);
          });
      });
    });

    describe('when token is valid', () => {
      it('returns data', () => {
        return request
          .get(`${baseURL}/unprotected`)
          .set('Content-Type', 'application/json')
          .set('Authorization', accessToken)
          .then(response => {
            expect(response.body.success).to.equal(true);
          });
      });
    });
  });

  describe('when redirects are enabled', () => {
    let data;

    beforeEach(() => {
      data = {
        email: 'admin@feathersjs.com',
        password: 'admin'
      };
    });

    describe('authentication succeeds', () => {
      it('redirects', () => {
        return request
          .post(`${baseURL}/login`)
          .send(data)
          .then(response => {
            expect(response.status).to.equal(200);
            expect(response.body).to.deep.equal({ success: true });
          });
      });
    });

    describe('authentication fails', () => {
      it('redirects', () => {
        data.password = 'invalid';
        return request
          .post(`${baseURL}/login`)
          .send(data)
          .then(response => {
            expect(response.body.success).to.equal(false);
          });
      });
    });
  });

  describe('events', () => {
    let data;

    beforeEach(() => {
      data = {
        strategy: 'local',
        email: 'admin@feathersjs.com',
        password: 'admin'
      };
    });

    describe('when authentication succeeds', () => {
      it('emits login event', done => {
        app.once('login', function (auth, info) {
          expect(info.provider).to.equal('rest');
          expect(info.req).to.exist;
          expect(info.res).to.exist;
          done();
        });

        request.post(`${baseURL}/authentication`).send(data).end();
      });
    });

    describe('authentication fails', () => {
      it('does not emit login event', done => {
        data.password = 'invalid';
        const handler = sinon.spy();
        app.once('login', handler);

        request.post(`${baseURL}/authentication`)
          .send(data)
          .then(response => {
            expect(response).to.not.be.ok; // should not get here
          })
          .catch(error => {
            expect(error.status).to.equal(401);

            setTimeout(function () {
              expect(handler).to.not.have.been.called;
              done();
            }, 100);
          });
      });
    });

    describe('when logout succeeds', () => {
      it('emits logout event', done => {
        app.once('logout', function (auth, info) {
          expect(info.provider).to.equal('rest');
          expect(info.req).to.exist;
          expect(info.res).to.exist;
          done();
        });

        request.post(`${baseURL}/authentication`)
          .send(data)
          .then(response => {
            return request
              .del(`${baseURL}/authentication`)
              .set('Content-Type', 'application/json')
              .set('Authorization', response.body.accessToken);
          })
          .then(response => {
            expect(response.status).to.equal(200);
          });
      });
    });
  });
});
