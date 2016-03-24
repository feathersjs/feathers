import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { populateUser } from '../../../src/hooks';

chai.use(sinonChai);

const fn = sinon.stub();
const User = { name: 'Mary' };
const mockGet = sinon.stub().returns(Promise.resolve(User));
const mockService = sinon.stub().returns({
  get: mockGet
});

describe('populateUser', () => {
  describe('when user id is missing', () => {
    it('does not do anything', done => {
      let hook = {
        params: {},
        app: {
          get: fn
        }
      };

      populateUser()(hook).then(returnedHook => {
        expect(hook).to.deep.equal(returnedHook);
        done();
      }).catch(done);
    });
  });

  describe('when used as an after hook', () => {
    let hook;

    beforeEach(() => {
      hook = {
        type: 'after',
        params: {},
        result: {},
        app: {
          get: fn,
          service: mockService
        }
      };
    });

    describe('when using default options', () => {
      beforeEach(() => {
        hook.result._id = '1';
      });

      it('calls service with correct userEndpoint', done => {
        populateUser()(hook).then(() => {
          expect(mockService).to.be.calledWith('/users');
          done();
        }).catch(done);
      });

      it('calls get with correct id', done => {
        populateUser()(hook).then(() => {
          expect(mockGet).to.be.calledWith('1');
          done();
        }).catch(done);
      });

      it('adds the user to params', done => {
        populateUser()(hook).then(hook => {
          expect(hook.params.user).to.deep.equal(User);
          done();
        }).catch(done);
      });

      it('adds the user to result.data', done => {
        populateUser()(hook).then(hook => {
          expect(hook.result.data).to.deep.equal(User);
          done();
        }).catch(done);
      });

      it('removes the id from the result object root', done => {
        populateUser()(hook).then(hook => {
          expect(hook.result._id).to.equal(undefined);
          done();
        }).catch(done);
      });
    });

    describe('when using options from global auth config', () => {
      beforeEach(() => {
        hook.result.id = '2';
        hook.app.get = function() {
          return { idField: 'id', userEndpoint: 'api/users' };
        };
      });

      it('calls service with correct userEndpoint', done => {
        populateUser()(hook).then(() => {
          expect(mockService).to.be.calledWith('api/users');
          done();
        }).catch(done);
      });

      it('calls get with correct id', done => {
        populateUser()(hook).then(() => {
          expect(mockGet).to.be.calledWith('2');
          done();
        }).catch(done);
      });

      it('adds the user to params', done => {
        populateUser()(hook).then(hook => {
          expect(hook.params.user).to.deep.equal(User);
          done();
        }).catch(done);
      });

      it('adds the user to result.data', done => {
        populateUser()(hook).then(hook => {
          expect(hook.result.data).to.deep.equal(User);
          done();
        }).catch(done);
      });

      it('removes the id from the result object root', done => {
        populateUser()(hook).then(hook => {
          expect(hook.result.id).to.equal(undefined);
          done();
        }).catch(done);
      });
    });

    describe('when using custom options', () => {
      let options;

      beforeEach(() => {
        hook.result.id = '2';
        options = { idField: 'id', userEndpoint: 'api/users' };
      });

      it('calls service with correct userEndpoint', done => {
        populateUser(options)(hook).then(() => {
          expect(mockService).to.be.calledWith('api/users');
          done();
        }).catch(done);
      });

      it('calls get with correct id', done => {
        populateUser(options)(hook).then(() => {
          expect(mockGet).to.be.calledWith('2');
          done();
        }).catch(done);
      });

      it('adds the user to params', done => {
        populateUser(options)(hook).then(hook => {
          expect(hook.params.user).to.deep.equal(User);
          done();
        }).catch(done);
      });

      it('adds the user to result.data', done => {
        populateUser(options)(hook).then(hook => {
          expect(hook.result.data).to.deep.equal(User);
          done();
        }).catch(done);
      });

      it('removes the id from the result object root', done => {
        populateUser(options)(hook).then(hook => {
          expect(hook.result.id).to.equal(undefined);
          done();
        }).catch(done);
      });
    });
  });
});