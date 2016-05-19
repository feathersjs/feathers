'use strict';

const assert = require('assert');
const transform = require('../lib/transform');

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

  it('addImport with hyphenated-name', () => {
    const ast = transform.addImport(`
      const first = require('first');
      
      module.exports = function() {
        // A comment
      };
    `, 'my-service', 'my-service');

    const output = transform.print(ast);

    assert.equal(output, `
      const myService = require('my-service');
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
      // a comment
      exports.before = ['before', 1, 2];
      exports.after = ['after', 2, 3];
      exports.after = [4, 5];
    `);
    
    const node = transform.findFirstNodeAfter(ast, 'exports.after', 'ArrayExpression');
    
    const output = transform.print(node);
    
    assert.equal(output, '[\'after\', 2, 3]');
  });
  
  it('addLastInFunction', () => {
    const code = `
      'use strict';
      
      const messages = require('./messages');

      module.exports = function() {
        const app = this;
        
        app.configure(messages);
      };
    `;
    
    const ast = transform.parse(code);
    const result = transform.addLastInFunction(ast, 'module.exports', 'app.configure(something());');
    
    assert.equal(transform.print(result), `
      'use strict';
      
      const messages = require('./messages');

      module.exports = function() {
        const app = this;

        app.configure(messages);
        app.configure(something());
      };
    `);
  });
  
  it('addToArrayInObject', () => {
    const ast = transform.addToArrayInObject(`
      const x = {
        test: [1],
        // another comment
        other: [2, 
          3]
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
        // another comment
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
        all: [
          // otherCommentedOut();
          /* commentedOut() */
        ],
        create: [addUser()]
      }
      
      exports.after = {
        all: [
          // otherCommentedOut()
          /* commentedOut() */
        ],
        create: [addUser({ some: 'test' })]
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
        create: [addUser({ some: 'test' }), doSomething()]
      }
    `);
  });
});
