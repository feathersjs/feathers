/* eslint-disable no-unused-expressions */
const chai = require('chai');

const { protect } = require('../../lib/hooks');
const { expect } = chai;

function testOmit (title, property) {
  describe(title, () => {
    const fn = protect('password');

    it('omits from object', () => {
      const data = {
        email: 'test@user.com',
        password: 'supersecret'
      };
      const context = {
        [property]: data
      };
      const result = fn(context);

      expect(result).to.deep.equal({
        [property]: data,
        dispatch: { email: 'test@user.com' }
      });
    });

    it('omits from array', () => {
      const data = [{
        email: 'test1@user.com',
        password: 'supersecret'
      }, {
        email: 'test2@user.com',
        password: 'othersecret'
      }];
      const context = {
        [property]: data
      };
      const result = fn(context);

      expect(result).to.deep.equal({
        [property]: data,
        dispatch: [
          { email: 'test1@user.com' },
          { email: 'test2@user.com' }
        ]
      });
    });

    it('omits from pagination object', () => {
      const data = {
        total: 2,
        data: [{
          email: 'test1@user.com',
          password: 'supersecret'
        }, {
          email: 'test2@user.com',
          password: 'othersecret'
        }]
      };
      const context = {
        [property]: data
      };
      const result = fn(context);

      expect(result).to.deep.equal({
        [property]: data,
        dispatch: {
          total: 2,
          data: [
            { email: 'test1@user.com' },
            { email: 'test2@user.com' }
          ]
        }
      });
    });

    it('updates result if params.provider is set', () => {
      const data = [{
        email: 'test1@user.com',
        password: 'supersecret'
      }, {
        email: 'test2@user.com',
        password: 'othersecret'
      }];
      const params = { provider: 'test' };
      const context = {
        [property]: data,
        params
      };
      const result = fn(context);

      expect(result).to.deep.equal({
        [property]: data,
        params,
        result: [
          { email: 'test1@user.com' },
          { email: 'test2@user.com' }
        ],
        dispatch: [
          { email: 'test1@user.com' },
          { email: 'test2@user.com' }
        ]
      });
    });
  });
}

describe('hooks:protect', () => {
  it('does nothing when called with no result', () => {
    const fn = protect();
    const original = {};

    expect(fn(original)).to.deep.equal(original);
  });

  testOmit('with hook.result', 'result');
  testOmit('with hook.dispatch already set', 'dispatch');
});
