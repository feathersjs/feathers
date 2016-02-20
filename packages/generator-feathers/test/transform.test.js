'use strict';

const assert = require('assert');
const transform = require('../lib/transforms');

describe('transforms', () => {
  it('simple addImport', () => {
    const ast = transform.addImport(`
      const first = require('first');
      
      module.exports = function() {
        // A comment
      };
    `, 's', 'second');
    
    const output = transform.print(ast);
    
    assert.equal(output, `
      const s = require('second');
      const first = require('first');

      module.exports = function() {
        // A comment
      };
    `);
  });
  
  it('addImport with \'use strict\';', () => {
    const code = `
      'use strict';

      const first = require('first');

      module.exports = function() {
        // A comment
      };
    `;
    
    const ast = transform.parse(code);
    
    transform.addImport(ast, 's', 'second');
    transform.addImport(ast, 'third', 'third');
    
    const output = transform.print(ast);
    
    assert.equal(output, `
      'use strict';

      const third = require('third');
      const s = require('second');

      const first = require('first');

      module.exports = function() {
        // A comment
      };
    `);
  });
  
  it('findFirstNodeAfter', () => {
    const ast = transform.parse(`
      exports.before = ['before', 1, 2];
      exports.after = ['after', 2, 3];
      exports.after = [4, 5];
    `);
    
    const node = transform.findFirstNodeAfter(ast, 'exports.after', 'ArrayExpression');
    
    const output = transform.print(node);
    
    assert.equal(output, '[\'after\', 2, 3]');
  });
  
  it('addToArrayInObject', () => {
    const ast = transform.addToArrayInObject(`
      const x = {
        test: [1],
        other: [2, 3]
      }
      
      const y = {
        test: [],
        other: [1]
      }
    `, 'x', 'other', 'body()');
    
    const output = transform.print(ast);
    
    assert.equal(output, `
      const x = {
        test: [1],
        other: [2, 3, body()]
      }
      
      const y = {
        test: [],
        other: [1]
      }
    `);
  });
  
  it('addToArrayInObject for hook objects', () => {
    const ast = transform.parse(`
      exports.before = {
        all: [],
        create: [addUser()]
      }
      
      exports.after = {
        all: [],
        create: [addUser()]
      }
    `);
    
    transform.addToArrayInObject(ast, 'exports.before', 'all', 'requireUser()');
    transform.addToArrayInObject(ast, 'exports.after', 'all', 'deletePassword()');
    transform.addToArrayInObject(ast, 'exports.after', 'create', 'doSomething()');
    
    const output = transform.print(ast);
    
    assert.equal(output, `
      exports.before = {
        all: [requireUser()],
        create: [addUser()]
      }
      
      exports.after = {
        all: [deletePassword()],
        create: [addUser(), doSomething()]
      }
    `);
  });
});
