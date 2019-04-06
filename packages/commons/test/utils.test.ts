/* tslint:disable:no-unused-expression */

import { expect } from 'chai';

import {
  _,
  stripSlashes,
  isPromise,
  makeUrl,
  createSymbol
} from '../src';

describe('@feathersjs/commons utils', () => {
  it('stripSlashes', () => {
    expect(stripSlashes('some/thing')).to.equal('some/thing');
    expect(stripSlashes('/some/thing')).to.equal('some/thing');
    expect(stripSlashes('some/thing/')).to.equal('some/thing');
    expect(stripSlashes('/some/thing/')).to.equal('some/thing');
    expect(stripSlashes('//some/thing/')).to.equal('some/thing');
    expect(stripSlashes('//some//thing////')).to.equal('some//thing');
  });

  it('isPromise', () => {
    expect(isPromise(Promise.resolve())).to.equal(true);
    expect(isPromise({
      then () {}
    })).to.equal(true);
    expect(isPromise(null)).to.equal(false);
  });

  it('createSymbol', () => {
    expect(typeof createSymbol('a test')).to.equal('symbol');
  });

  describe('_', () => {
    it('isObject', () => {
      expect(_.isObject({})).to.equal(true);
      expect(_.isObject([])).to.equal(false);
      expect(_.isObject(null)).to.equal(false);
    });

    it('isObjectOrArray', () => {
      expect(_.isObjectOrArray({})).to.equal(true);
      expect(_.isObjectOrArray([])).to.equal(true);
      expect(_.isObjectOrArray(null)).to.equal(false);
    });

    it('each', () => {
      _.each({ hi: 'there' }, (value, key) => {
        expect(key).to.equal('hi');
        expect(value).to.equal('there');
      });

      _.each([ 'hi' ], (value, key) => {
        expect(key).to.equal(0);
        expect(value).to.equal('hi');
      });

      _.each('moo', () => expect(false)
        .to.equal(true, 'Should never get here')
      );
    });

    it('some', () => {
      expect(_.some([ 'a', 'b' ], current => current === 'a')).to.be.ok;
      expect(!_.some([ 'a', 'b' ], current => current === 'c')).to.be.ok;
    });

    it('every', () => {
      expect(_.every([ 'a', 'a' ], current => current === 'a')).to.be.ok;
      expect(!_.every([ 'a', 'b' ], current => current === 'a')).to.be.ok;
    });

    it('keys', () => {
      const data = { hi: 'there', name: 'David' };
      expect(_.keys(data)).to.deep.equal([ 'hi', 'name' ]);
    });

    it('values', () => {
      const data = { hi: 'there', name: 'David' };
      expect(_.values(data)).to.deep.equal([ 'there', 'David' ]);
    });

    it('isMatch', () => {
      expect(_.isMatch({
        test: 'me', hi: 'you', more: true
      }, {
        test: 'me', hi: 'you'
      })).to.be.ok;

      expect(!_.isMatch({
        test: 'me', hi: 'you', more: true
      }, {
        test: 'me', hi: 'there'
      })).to.be.ok;
    });

    it('isEmpty', () => {
      expect(_.isEmpty({})).to.be.ok;
      expect(!_.isEmpty({ name: 'David' })).to.be.ok;
    });

    it('extend', () => {
      expect(_.extend({ hi: 'there' }, { name: 'david' })).to.deep.equal({
        hi: 'there',
        name: 'david'
      });
    });

    it('omit', () => {
      expect(_.omit({
        name: 'David',
        first: 1,
        second: 2
      }, 'first', 'second')).to.deep.equal({
        name: 'David'
      });
    });

    it('pick', () => {
      expect(_.pick({
        name: 'David',
        first: 1,
        second: 2
      }, 'first', 'second')).to.deep.equal({
        first: 1,
        second: 2
      });

      expect(_.pick({
        name: 'David',
        first: 1
      }, 'first', 'second')).to.deep.equal({
        first: 1
      });
    });

    it('merge', () => {
      expect(_.merge({ hi: 'there' }, { name: 'david' })).to.deep.equal({
        hi: 'there',
        name: 'david'
      });

      expect(_.merge({}, {
        name: 'david',
        nested: { obj: true }
      })).to.deep.equal({
        name: 'david',
        nested: { obj: true }
      });

      expect(_.merge({ name: 'david' }, {})).to.deep.equal({
        name: 'david'
      });

      expect(_.merge({
        hi: 'there',
        my: {
          name: { is: 'david' },
          number: { is: 1 }
        }
      }, { my: { name: { is: 'eric' } } })).to.deep.equal({
        hi: 'there',
        my: {
          number: { is: 1 },
          name: { is: 'eric' }
        }
      });

      expect(_.merge('hello', {})).to.equal('hello');
    });
  });

  describe('makeUrl', function () {
    let mockApp: any;

    beforeEach(() => {
      mockApp = { env: 'development' };
      mockApp.get = (value: any) => {
        switch (value) {
          case 'port':
            return 3030;
          case 'host':
            return 'feathersjs.com';
          case 'env':
            return mockApp.env;
        }
      };
    });

    it('when in development mode returns the correct url', () => {
      const uri = makeUrl('test', mockApp);
      expect(uri).to.equal('http://feathersjs.com:3030/test');
    });

    it('when in test mode returns the correct url', () => {
      mockApp.env = 'test';
      const uri = makeUrl('test', mockApp);
      expect(uri).to.equal('http://feathersjs.com:3030/test');
    });

    it('when in production mode returns the correct url', () => {
      mockApp.env = 'production';
      const uri = makeUrl('test', mockApp);
      expect(uri).to.equal('https://feathersjs.com/test');
    });

    it('when path is not provided returns a default url', () => {
      const uri = makeUrl(null, mockApp);
      expect(uri).to.equal('http://feathersjs.com:3030/');
    });

    it('when app is not defined returns the correct url', () => {
      const uri = makeUrl('test');
      expect(uri).to.equal('http://localhost:3030/test');
    });

    it('strips leading slashes on path', () => {
      const uri = makeUrl('/test');
      expect(uri).to.equal('http://localhost:3030/test');
    });

    it('strips trailing slashes on path', () => {
      const uri = makeUrl('test/');
      expect(uri).to.equal('http://localhost:3030/test');
    });

    it('works with query strings', () => {
      const uri = makeUrl('test?admin=true');
      expect(uri).to.equal('http://localhost:3030/test?admin=true');
    });
  });
});
