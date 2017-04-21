/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import express from '../../src/express';

describe('express middleware', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../../lib/express')).to.equal('object');
  });

  it('is ES6 compatible', () => {
    expect(typeof express).to.equal('object');
  });

  it('exposes authenticate middleware', () => {
    expect(typeof express.authenticate).to.equal('function');
  });

  it('exposes exposeHeaders middleware', () => {
    expect(typeof express.exposeHeaders).to.equal('function');
  });

  it('exposes exposeCookies middleware', () => {
    expect(typeof express.exposeCookies).to.equal('function');
  });

  it('exposes failureRedirect middleware', () => {
    expect(typeof express.failureRedirect).to.equal('function');
  });

  it('exposes successRedirect middleware', () => {
    expect(typeof express.successRedirect).to.equal('function');
  });

  it('exposes setCookie middleware', () => {
    expect(typeof express.setCookie).to.equal('function');
  });

  it('exposes emitEvents middleware', () => {
    expect(typeof express.emitEvents).to.equal('function');
  });
});
