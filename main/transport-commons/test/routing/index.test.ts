import {
  assert,
  assertEquals,
  assertStrictEquals,
  beforeEach,
  describe,
  it,
} from "../../../commons/mod.ts";
import { Application, feathers } from "../../../feathers/mod.ts";
import { routing } from "../../src/routing/index.ts";

describe("app.routes", () => {
  let app: Application;

  beforeEach(() => {
    app = feathers().configure(routing());

    app.use("/my/service", {
      get(id: string | number) {
        return Promise.resolve({ id });
      },
    });
  });

  it("does nothing when configured twice", () => {
    feathers().configure(routing()).configure(routing());
  });

  it("has app.lookup and app.routes", () => {
    assertStrictEquals(typeof app.lookup, "function");
    assert(app.routes);
  });

  it("returns null when nothing is found", () => {
    const result = app.lookup("me/service");

    assertStrictEquals(result, null);
  });

  it("returns null for invalid service path", () => {
    // @ts-ignore
    assertStrictEquals(app.lookup(null), null);
    // @ts-ignore
    assertStrictEquals(app.lookup({}), null);
  });

  it("can look up and strips slashes", () => {
    const result = app.lookup("my/service");

    assertStrictEquals(result?.service, app.service("/my/service/"));
  });

  it("can look up with id", () => {
    const result = app.lookup("/my/service/1234");

    assertStrictEquals(result?.service, app.service("/my/service"));

    assertEquals(result.params, {
      __id: "1234",
    });
  });

  it("can look up with params, id and special characters", () => {
    const path = "/test/:first/my/:second";

    app.use(path, {
      async get(id: string | number) {
        return { id };
      },
    });

    const result = app.lookup("/test/me/my/::special/testing");

    assertStrictEquals(result?.service, app.service(path));
    assertEquals(result.params, {
      __id: "testing",
      first: "me",
      second: "::special",
    });
  });

  it("can register routes with preset params", () => {
    app.routes.insert("/my/service/:__id/preset", {
      service: app.service("/my/service"),
      params: { preset: true },
    });

    const result = app.lookup("/my/service/1234/preset");

    assertStrictEquals(result?.service, app.service("/my/service"));
    assertEquals(result.params, {
      preset: true,
      __id: "1234",
    });
  });

  it("can pass route params during a service registration", () => {
    app.use(
      "/other/service",
      {
        async get(id: any) {
          return id;
        },
      },
      {
        routeParams: { used: true },
      },
    );

    const result = app.lookup("/other/service/1234");

    assertStrictEquals(result?.service, app.service("/other/service"));
    assertEquals(result.params, {
      used: true,
      __id: "1234",
    });
  });

  it("can unregister a service (#2035)", async () => {
    const result = app.lookup("my/service");

    assertStrictEquals(result?.service, app.service("/my/service/"));

    await app.unuse("/my/service");

    assertStrictEquals(app.lookup("my/service"), null);
  });
});
