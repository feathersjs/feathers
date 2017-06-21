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

  it('findDeclaration', () => {
    const code = `
      const a = "test";
      const b = "hi";
    `;
    const result = j(code).findDeclaration('b').insertBefore('const x = 2;').toSource();

    assert.equal(result, `
      const a = "test";
      const x = 2;
      const b = "hi";
    `);
  });

  it('insertHook', () => {
    const code = `
      module.exports = {
        before: {
          all: [],
          create: []
        }
      }
    `;
    const result = j(code).insertHook('before', 'create', 'testing').toSource();

    assert.equal(result, `
      module.exports = {
        before: {
          all: [],
          create: [testing()]
        }
      }
    `);
  });

  it('insertLastInFunction', () => {
    const code = `
      module.exports = function () {
        const app = this;
      };
    `;

    const result = j(code).insertLastInFunction('app.use(\'/test\', middleware);').toSource();

    assert.equal(result, `
      module.exports = function () {
        const app = this;
        app.use('/test', middleware);
      };
    `);
  });
});
