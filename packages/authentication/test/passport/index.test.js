import feathers from 'feathers';
import adapter from '../../src/passport';
import { expect } from 'chai';

describe('Feathers Passport Adapter', () => {
  let app;

  before(() => { app = feathers(); });

  it('is CommonJS compatible', () => {
    expect(typeof require('../../lib/passport')).to.equal('function');
  });

  it('is ES6 compatible', () => {
    expect(typeof adapter).to.equal('function');
  });

  it('exposes initialize function', () => {
    expect(typeof adapter.call(app).initialize).to.equal('function');
  });

  it('exposes authenticate function', () => {
    expect(typeof adapter.call(app).authenticate).to.equal('function');
  });
});
