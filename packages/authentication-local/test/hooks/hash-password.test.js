/* eslint-disable no-unused-expressions */
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const { hashPassword } = require('../../lib/hooks');
const { expect } = chai;

chai.use(sinonChai);

describe('hooks:hashPassword', () => {
  let hook;

  beforeEach(() => {
    hook = {
      type: 'before',
      data: { password: 'secret' },
      params: {},
      app: {
        get: () => {
          return {
            local: {
              passwordField: 'password'
            }
          };
        }
      }
    };
  });

  describe('when not called as a before hook', () => {
    it('returns an error', () => {
      hook.type = 'after';
      return hashPassword()(hook).catch(error => {
        expect(error).to.not.equal(undefined);
      });
    });
  });

  describe('when data does not exist', () => {
    it('does not do anything', () => {
      delete hook.data;
      return hashPassword()(hook).then(returnedHook => {
        expect(returnedHook).to.deep.equal(hook);
      });
    });
  });

  describe('when password does not exist', () => {
    it('does not do anything', () => {
      delete hook.data.password;
      return hashPassword()(hook).then(returnedHook => {
        expect(returnedHook).to.deep.equal(hook);
      });
    });
  });

  describe('when password exists', () => {
    it('hashes with options from global auth config', () => {
      return hashPassword()(hook).then(hook => {
        expect(hook.data.password).to.not.equal(undefined);
        expect(hook.data.password).to.not.equal('secret');
      });
    });

    it('hashes with custom options', () => {
      hook.data.pass = 'secret';

      return hashPassword({ passwordField: 'pass' })(hook).then(hook => {
        expect(hook.data.pass).to.not.equal(undefined);
        expect(hook.data.pass).to.not.equal('secret');
      });
    });

    it('calls custom hash function', () => {
      const fn = sinon.stub().returns(Promise.resolve());
      return hashPassword({ hash: fn })(hook).then(() => {
        expect(fn).to.have.been.calledOnce;
        expect(fn).to.have.been.calledWith('secret');
      });
    });

    it('returns an error when custom hash is not a function', () => {
      return hashPassword({ hash: true })(hook).catch(error => {
        expect(error).to.not.equal(undefined);
      });
    });
  });

  describe('when password exists in bulk', () => {
    beforeEach(() => {
      hook.data = [
        {password: 'secret'},
        {password: 'secret'}
      ];
    });

    it('hashes with options from global auth config', () => {
      return hashPassword()(hook).then(hook => {
        hook.data.map(item => {
          expect(item.password).to.not.equal(undefined);
          expect(item.password).to.not.equal('secret');
        });
      });
    });

    it('does not remove things if there is no password', () => {
      hook.data = [
        { id: 0, password: 'secret' },
        { id: 1 }
      ];

      return hashPassword()(hook).then(hook => {
        const { data } = hook;

        expect(data.length).to.equal(2);
        expect(data[0].password).to.not.equal('secret');
        expect(data[1]).to.exist;
      });
    });

    it('hashes with custom options', () => {
      hook.data = [
        {pass: 'secret'},
        {pass: 'secret'}
      ];

      return hashPassword({ passwordField: 'pass' })(hook).then(hook => {
        hook.data.map(item => {
          expect(item.pass).to.not.equal(undefined);
          expect(item.pass).to.not.equal('secret');
        });
      });
    });

    it('calls custom hash function', () => {
      const fn = sinon.stub().returns(Promise.resolve());
      return hashPassword({ hash: fn })(hook).then(() => {
        expect(fn).to.have.been.calledTwice;
        expect(fn).to.have.been.calledWith('secret');
      });
    });
  });
});
