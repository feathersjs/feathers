const { expect } = require('chai');
const { validateArguments } = require('../lib/arguments');

const argumentsOrders = {
  find: [ 'params' ],
  get: [ 'id', 'params' ],
  create: [ 'data', 'params' ],
  update: [ 'id', 'data', 'params' ],
  patch: [ 'id', 'data', 'params' ],
  remove: [ 'id', 'params' ]
};

describe('.validateArguments', () => {
  it('throws an error for callbacks', () => {
    try {
      validateArguments(argumentsOrders, 'find', [{}, function () {}]);
      throw new Error('Should never get here');
    } catch (e) {
      expect(e.message).to.equal('Callbacks are no longer supported. Use Promises or async/await instead.');
    }
  });

  it('errors with invalid parameter count', () => {
    const check = (method, args) => {
      try {
        validateArguments(argumentsOrders, method, args);
        throw new Error('Should never get here');
      } catch (e) {
        expect(e.message).to.equal(`Too many arguments for '${method}' method`);
      }
    };

    check('find', [ {}, {} ]);
    check('get', [ 1, {}, 'wrong' ]);
    check('create', [ {}, {}, null ]);
    check('update', [ 1, {}, {}, false ]);
    check('patch', [ 1, {}, {}, 'muhkuh' ]);
    check('remove', [ 1, {}, 'hi' ]);
  });

  it('errors if params is not an object', () => {
    const check = (method, args) => {
      try {
        validateArguments(argumentsOrders, method, args);
        throw new Error('Should never get here');
      } catch (e) {
        expect(e.message).to.equal(`Params for '${method}' method must be an object`);
      }
    };

    check('find', [ null ]);
    check('get', [ 1, false ]);
    check('create', [ {}, true ]);
    check('update', [ 1, {}, null ]);
    check('patch', [ 1, {}, 22 ]);
    check('remove', [ 1, 'hi' ]);
  });

  it('throws method specific errors', () => {
    const checkId = (method, args) => {
      try {
        validateArguments(argumentsOrders, method, args);
        throw new Error('Should never get here');
      } catch (e) {
        expect(e.message).to.equal(`An id must be provided to the '${method}' method`);
      }
    };
    const checkData = (method, args) => {
      try {
        validateArguments(argumentsOrders, method, args);
        throw new Error('Should never get here');
      } catch (e) {
        expect(e.message).to.equal(`A data object must be provided to the '${method}' method`);
      }
    };

    checkId('get', []);
    checkId('update', []);
    checkId('patch', []);
    checkId('remove', []);

    checkData('create', [ null ]);
    checkData('update', [ 1 ]);
    checkData('patch', [ 1, 'damnit' ]);
  });

  it('passes for valid arguments', () => {
    let result = validateArguments(argumentsOrders, 'find', [ {} ]);
    expect(result).to.equal(true);
    result = validateArguments(argumentsOrders, 'find', []);
    expect(result).to.equal(true);

    result = validateArguments(argumentsOrders, 'get', [ 1, {} ]);
    expect(result).to.equal(true);
    result = validateArguments(argumentsOrders, 'get', [ 1 ]);
    expect(result).to.equal(true);

    result = validateArguments(argumentsOrders, 'create', [ {}, {} ]);
    expect(result).to.equal(true);
    result = validateArguments(argumentsOrders, 'create', [ {} ]);
    expect(result).to.equal(true);

    result = validateArguments(argumentsOrders, 'update', [ 1, {}, {} ]);
    expect(result).to.equal(true);
    result = validateArguments(argumentsOrders, 'update', [ 1, {} ]);
    expect(result).to.equal(true);

    result = validateArguments(argumentsOrders, 'patch', [ 1, {}, {} ]);
    expect(result).to.equal(true);
    result = validateArguments(argumentsOrders, 'patch', [ 1, {} ]);
    expect(result).to.equal(true);

    result = validateArguments(argumentsOrders, 'remove', [ 1, {} ]);
    expect(result).to.equal(true);
    result = validateArguments(argumentsOrders, 'remove', [ 1 ]);
    expect(result).to.equal(true);
  });
});
