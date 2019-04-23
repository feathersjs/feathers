const chai = require('chai');
const sinonChai = require('sinon-chai');
const errors = require('@feathersjs/errors');

const handler = require('../lib/not-found-handler');

const { expect } = chai;

chai.use(sinonChai);

describe('not-found-handler', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../lib/not-found-handler')).to.equal('function');
  });

  it('is import compatible', () => {
    expect(typeof handler).to.equal('function');
  });

  it('returns NotFound error', done => {
    handler()({
      url: 'some/where',
      headers: {}
    }, {}, function (error) {
      expect(error instanceof errors.NotFound).to.equal(true);
      expect(error.message).to.equal('Page not found');
      expect(error.data).to.deep.equal({
        url: 'some/where'
      });
      done();
    });
  });

  it('returns NotFound error with URL when verbose', done => {
    handler({ verbose: true })({
      url: 'some/where',
      headers: {}
    }, {}, function (error) {
      expect(error instanceof errors.NotFound).to.equal(true);
      expect(error.message).to.equal('Page not found: some/where');
      expect(error.data).to.deep.equal({
        url: 'some/where'
      });
      done();
    });
  });
});
