// https://deno.land/manual/testing/assertions
import * as denoAssert from "https://deno.land/std@0.159.0/testing/asserts.ts";

const { assertEquals } = denoAssert;

export * from "https://deno.land/std@0.159.0/testing/bdd.ts";

export * from "https://deno.land/std@0.159.0/testing/asserts.ts";

export function assertDeepStrictEquals(
  actual: unknown,
  expected: unknown,
  msg?: string
) {
  return assertEquals(actual, expected, msg);
}
