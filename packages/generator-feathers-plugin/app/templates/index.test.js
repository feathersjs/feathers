import { expect } from 'chai';
import plugin from '../src';

describe('<%= name %>', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../lib')).to.equal('function');
  });

  it('basic functionality', done => {
    expect(typeof plugin).to.equal('function', 'It worked');
    done();
  });

  it('exposes the Service class', done => {
    expect(plugin.Service).to.not.equal(undefined);
    done();
  });
});
