import { expect } from 'chai';
import { populateEntity } from '../../src/hooks';

const user = { id: '1', name: 'Bob' };

describe('hooks:populateEntity', () => {
  let hook;
  let options;

  beforeEach(() => {
    hook = {
      type: 'after',
      params: {
        accessToken: 'my token',
        headers: {}
      },
      result: {},
      app: {
        passport: {
          verifyJWT: () => Promise.resolve({ userId: '1' })
        },
        set: () => {},
        service: () => {
          return {
            get: () => Promise.resolve(user)
          };
        }
      }
    };

    options = {
      service: 'users',
      field: 'userId',
      entity: 'user'
    };
  });

  describe('when options.service is missing', () => {
    it('throws an error', () => {
      delete options.service;

      expect(() => {
        populateEntity(options);
      }).to.throw;
    });
  });

  describe('when options.field is missing', () => {
    it('throws an error', () => {
      delete options.field;

      expect(() => {
        populateEntity(options);
      }).to.throw;
    });
  });

  describe('when options.entity is missing', () => {
    it('throws an error', () => {
      delete options.entity;

      expect(() => {
        populateEntity(options);
      }).to.throw;
    });
  });

  describe('when not called as an after hook', () => {
    it('returns an error', () => {
      hook.type = 'before';

      return populateEntity(options)(hook).catch(error => {
        expect(error).to.not.equal(undefined);
      });
    });
  });

  it('populates an entity by token payload id', () => {
    return populateEntity(options)(hook).then(hook => {
      expect(hook.result.user).to.deep.equal(user);
    });
  });
});
