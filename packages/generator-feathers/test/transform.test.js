'use strict';

const assert = require('assert');
const j = require('../lib/transform');

describe('transforms', () => {
  it('findConfigure', () => {
    const code = `
      const feathers = require('feathers');

      const app = feathers();

      app.configure(thing);
      app.configure(authentication);
    `;

    const result = j(code).findConfigure('authentication').insertBefore('app.configure(muhkuh);').toSource();

    assert.equal(result, `
      const feathers = require('feathers');

      const app = feathers();

      app.configure(thing);
      app.configure(muhkuh);
      app.configure(authentication);
    `);
  });
});
