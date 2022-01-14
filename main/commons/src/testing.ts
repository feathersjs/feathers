// https://deno.land/manual/testing/assertions
import * as denoAssert from 'https://deno.land/std@0.114.0/testing/asserts.ts';

const { assertEquals } = denoAssert

export * from 'https://deno.land/std@0.114.0/testing/asserts.ts';

export const it = (name: string, fn: () => any, only = false) => Deno.test({
  only,
  name,
  fn
});

it.only = (name: string, fn: () => any) => it(name, fn, true);

export const assert = {
  deepStrictEqual (actual: unknown, expected: unknown, msg?: string) {
    return assertEquals(actual, expected, msg)
  }
}
