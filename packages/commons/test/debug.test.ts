import { strict as assert } from 'assert';
import { createDebug, setDebug, noopDebug, simpleConsole } from '../src';

const myDebug = createDebug('hello test');

describe('debug', () => {
  it('default debug does nothing', () => {
    assert.equal(myDebug('hi', 'there'), undefined);
  });

  it('simpleConsole', () => {
    setDebug(simpleConsole);

    assert.equal(myDebug('hi', 'there'), undefined);

    setDebug(noopDebug);
  });

  it('can set other debug later', () => {
    let call;

    const customDebug = (name: string) => (...args: any[]) => {
      call = [ name ].concat(args);
    }

    setDebug(customDebug);

    assert.equal(myDebug('hi', 'there'), undefined);
    assert.deepEqual(call, [ 'hello test', 'hi', 'there' ]);

    const newDebug = createDebug('other test');

    assert.equal(newDebug('other', 'there'), undefined);
    assert.deepEqual(call, [ 'other test', 'other', 'there' ]);

    setDebug(noopDebug);
  });
});
