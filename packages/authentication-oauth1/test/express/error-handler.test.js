import { expect } from 'chai';
import errorHandler from '../../src/express/error-handler';

describe('express:error-handler', () => {
  let req;
  let res;
  let error;
  let options;

  beforeEach(() => {
    req = {};
    options = {};
    res = {
      hook: {
        data: {
          __redirect: {
            url: '/app'
          }
        }
      }
    };
    error = new Error('Authentication Error');
  });

  describe('when failureRedirect is set', () => {
    it('sets the redirect object on the response', done => {
      options.failureRedirect = '/login';
      errorHandler(options)(error, req, res, () => {
        expect(res.hook.data.__redirect).to.deep.equal({ status: 302, url: options.failureRedirect });
        done();
      });
    });

    it('calls next with error', done => {
      delete res.hook;
      errorHandler(options)(error, req, res, e => {
        expect(e).to.equal(error);
        done();
      });
    });
  });

  describe('when failureRedirect is not set', done => {
    it('calls next with error', done => {
      delete res.hook;
      errorHandler(options)(error, req, res, e => {
        expect(e).to.equal(error);
        done();
      });
    });
  });
});
