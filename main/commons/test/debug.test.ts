import { it, assertEquals, assertStrictEquals } from '../src/testing.ts';
import { createDebug, setDebug, noopDebug } from '../src/index.ts';

const myDebug = createDebug('hello test');

it('default debug does nothing', () => {
  assertStrictEquals(myDebug('hi', 'there'), undefined);
});

it('can set custom debug later', () => {
  let call;

  const customDebug = (name: string) => (...args: any[]) => {
    call = [ name ].concat(args);
  }

  setDebug(customDebug);

  assertStrictEquals(myDebug('hi', 'there'), undefined);
  assertEquals(call, [ 'hello test', 'hi', 'there' ]);

  const newDebug = createDebug('other test');

  assertStrictEquals(newDebug('other', 'there'), undefined);
  assertEquals(call, [ 'other test', 'other', 'there' ]);

  setDebug(noopDebug);
});
