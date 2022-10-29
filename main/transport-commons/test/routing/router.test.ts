import {
  assert,
  assertEquals,
  assertStrictEquals,
  assertThrows,
  describe,
  it,
} from "../../../commons/mod.ts";
import { Router } from "../../src/routing/index.ts";

describe("router", () => {
  it("can lookup and insert a simple path and returns null for invalid path", () => {
    const r = new Router<string>();

    r.insert("/hello/there/you", "test");

    const result = r.lookup("hello/there/you/");

    assertEquals(result, {
      params: {},
      data: "test",
    });

    assertStrictEquals(r.lookup("not/there"), null);
    assertStrictEquals(r.lookup("not-me"), null);
  });

  it("can insert data at the root", () => {
    const r = new Router<string>();

    r.insert("", "hi");

    const result = r.lookup("/");

    assertEquals(result, {
      params: {},
      data: "hi",
    });
  });

  it("can insert with placeholder and has proper specificity", () => {
    const r = new Router<string>();

    r.insert("/hello/:id", "one");
    r.insert("/hello/:id/you", "two");
    r.insert("/hello/:id/:other", "three");

    const first = r.lookup("hello/there/");

    assertThrows(
      () => r.insert("/hello/:id/you", "two"),
      "Path hello/:id/you already exists",
    );

    assertEquals(first, {
      params: { id: "there" },
      data: "one",
    });

    const second = r.lookup("hello/yes/you");

    assertEquals(second, {
      params: { id: "yes" },
      data: "two",
    });

    const third = r.lookup("hello/yes/they");

    assertEquals(third, {
      params: {
        id: "yes",
        other: "they",
      },
      data: "three",
    });

    assertStrictEquals(r.lookup("hello/yes/they/here"), null);
  });

  it("works with different placeholders in different paths (#2327)", () => {
    const r = new Router<string>();

    r.insert("/hello/:id", "one");
    r.insert("/hello/:test/you", "two");
    r.insert("/hello/:test/:two/hi/:three", "three");
    r.insert("/hello/:test/:two/hi", "four");

    assertEquals(r.lookup("/hello/there"), {
      params: { id: "there" },
      data: "one",
    });
    assertEquals(r.lookup("/hello/there/you"), {
      params: { test: "there" },
      data: "two",
    });
    assertStrictEquals(r.lookup("/hello/there/bla"), null);
    assertEquals(r.lookup("/hello/there/maybe/hi"), {
      params: { test: "there", two: "maybe" },
      data: "four",
    });
    assertEquals(r.lookup("/hello/there/maybe/hi/test"), {
      params: { three: "test", two: "maybe", test: "there" },
      data: "three",
    });
  });

  it("can remove paths (#2035)", () => {
    const r = new Router<string>();

    r.insert("/hello/:id", "one");
    r.insert("/hello/:test/you", "two");
    r.insert("/hello/here/thing", "else");

    assertEquals(r.lookup("hello/there"), {
      params: { id: "there" },
      data: "one",
    });

    r.remove("/hello/:id");

    assertEquals(r.lookup("hello/here/you"), {
      params: { test: "here" },
      data: "two",
    });
    assertEquals(r.lookup("hello/here/thing"), {
      params: {},
      data: "else",
    });
    assertStrictEquals(r.lookup("hello/there"), null);

    r.remove("/hello/:test/you");
    assertStrictEquals(r.lookup("hello/here/you"), null);
    assertEquals(r.lookup("hello/here/thing"), {
      params: {},
      data: "else",
    });

    r.remove("/hello/here/thing");
    assert(!r.root.hasChildren);
  });
});
