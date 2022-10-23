// deno-lint-ignore-file require-await
/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-empty-function */
import {
  describe,
  it,
  assertStrictEquals,
  assert,
  assertInstanceOf,
  assertThrows,
  assertEquals,
} from "../../commons/mod.ts";
import { feathers, Feathers, getServiceOptions, Id, version } from "../mod.ts";

describe("Feathers application", () => {
  it("initializes", () => {
    const app = feathers();

    assertInstanceOf(app, Feathers);
  });

  it("sets the version on main and app instance", () => {
    const app = feathers();

    assert(version > "5.0.0");
    assert(app.version > "5.0.0");
  });

  it("is an event emitter", async () => {
    const app = feathers();
    const original = { hello: "world" };

    app.on("test", (data: any) => {
      assertStrictEquals(original, data);
    });

    app.emit("test", original);
  });

  it("uses .defaultService if available", async () => {
    const app = feathers();

    assertThrows(() => app.service("/todos/"), "Can not find service 'todos'");

    app.defaultService = function (location: string) {
      assertStrictEquals(location, "todos");
      return {
        async get(id: string) {
          return {
            id,
            description: `You have to do ${id}!`,
          };
        },
      };
    };

    const data = await app.service("/todos/").get("dishes");

    assertEquals(data, {
      id: "dishes",
      description: "You have to do dishes!",
    });
  });

  it("additionally passes `app` as .configure parameter (#558)", () => {
    feathers().configure(function (app) {
      assertStrictEquals(this, app);
    });
  });

  describe("Services", () => {
    it("calling .use with invalid path throws", () => {
      const app = feathers();

      assertThrows(
        // @ts-ignore
        () => app.use(null, {}),
        "'null' is not a valid service path."
      );

      assertThrows(
        // @ts-ignore
        () => app.use({}, {}),
        "'[object Object]' is not a valid service path."
      );
    });

    it("calling .use with a non service object throws", () => {
      const app = feathers();

      // @ts-ignore
      assertThrows(() => app.use("/bla", function () {}), {
        message: "Invalid service object passed for path `bla`",
      });
    });

    it("registers and wraps a new service and can unregister (#2035)", async () => {
      const dummyService = {
        async setup(this: any, _app: any, path: string) {
          this.path = path;
        },

        async teardown(this: any, _app: any, path: string) {
          this.path = path;
        },

        async create(data: any) {
          return data;
        },
      };

      const app = feathers<{ dummy: typeof dummyService }>().use(
        "dummy",
        dummyService
      );
      const wrappedService = app.service("dummy");

      assertStrictEquals(
        Object.getPrototypeOf(wrappedService),
        dummyService,
        "Object points to original service prototype"
      );

      const data = await wrappedService.create({
        message: "Test message",
      });

      assertStrictEquals(data.message, "Test message");

      await app.unuse("dummy");

      assertStrictEquals(Object.keys(app.services).length, 0);
      assertThrows(() => app.service("dummy"), "Can not find service 'dummy'");
    });

    it("can not register custom methods on a protected methods", async () => {
      const dummyService = {
        async create(data: any) {
          return data;
        },
        // deno-lint-ignore require-await
        async removeListener(data: any) {
          return data;
        },
        async setup() {},

        async teardown() {},
      };

      assertThrows(
        () =>
          feathers().use("/dummy", dummyService, {
            methods: ["create", "removeListener"],
          }),
        "'removeListener' on service 'dummy' is not allowed as a custom method name"
      );
      assertThrows(
        () =>
          feathers().use("/dummy", dummyService, {
            methods: ["create", "setup"],
          }),
        "'setup' on service 'dummy' is not allowed as a custom method name"
      );
      assertThrows(
        () =>
          feathers().use("/dummy", dummyService, {
            methods: ["create", "teardown"],
          }),
        "'teardown' on service 'dummy' is not allowed as a custom method name"
      );
    });

    it("can use a root level service", async () => {
      const app = feathers().use("/", {
        // deno-lint-ignore require-await
        async get(id: string) {
          return { id };
        },
      });

      const result = await app.service("/").get("test");

      assertEquals(result, { id: "test" });
    });

    it("services can be re-used (#566)", async () => {
      const app1 = feathers();
      const app2 = feathers();

      app2.use("/dummy", {
        // deno-lint-ignore require-await
        async create(data: any) {
          return data;
        },
      });

      const dummy = app2.service("dummy");

      dummy.hooks({
        before: {
          create: [
            (hook) => {
              hook.data = Object.assign(hook.data || {}, { fromHook: true });
            },
          ],
        },
      });

      dummy.on("created", (data: any) => {
        assertEquals(data, {
          message: "Hi",
          fromHook: true,
        });
      });

      app1.use("/testing", app2.service("dummy"));

      await app1.service("testing").create({ message: "Hi" });
    });

    it("async hooks run before regular hooks", async () => {
      const app = feathers();

      app.use("/dummy", {
        async create(data: any) {
          return data;
        },
      });

      const dummy = app.service("dummy");

      dummy.hooks({
        before: {
          create(ctx) {
            ctx.data!.order.push("before");
          },
        },
      });

      dummy.hooks([
        async (ctx: any, next: any) => {
          ctx.data.order = ["async"];
          await next();
        },
      ]);

      const result = await dummy.create({
        message: "hi",
      });

      assertEquals(result, {
        message: "hi",
        order: ["async", "before"],
      });
    });

    it("services conserve Symbols", () => {
      const TEST = Symbol("test");
      const dummyService = {
        [TEST]: true,

        async setup(this: any, _app: any, path: string) {
          this.path = path;
        },

        async create(data: any) {
          return data;
        },
      };

      const app = feathers().use("/dummy", dummyService);
      const wrappedService = app.service("dummy");

      assert((wrappedService as any)[TEST]);
    });

    it("methods conserve Symbols", () => {
      const TEST = Symbol("test");
      const dummyService = {
        async setup(this: any, _app: any, path: string) {
          this.path = path;
        },

        async create(data: any) {
          return data;
        },
      };

      (dummyService.create as any)[TEST] = true;

      const app = feathers().use("/dummy", dummyService);
      const wrappedService = app.service("dummy");

      assert((wrappedService.create as any)[TEST]);
    });
  });

  describe("Express app options compatibility", function () {
    describe(".set()", () => {
      it("should set a value", () => {
        const app = feathers();
        app.set("foo", "bar");
        assertStrictEquals(app.get("foo"), "bar");
      });

      it("should return the app", () => {
        const app = feathers();
        assertStrictEquals(app.set("foo", "bar"), app);
      });

      it("should return the app when undefined", () => {
        const app = feathers();
        assertStrictEquals(app.set("foo", undefined), app);
      });
    });

    describe(".get()", () => {
      it("should return undefined when unset", () => {
        const app = feathers();
        assertStrictEquals(app.get("foo"), undefined);
      });

      it("should otherwise return the value", () => {
        const app = feathers();
        app.set("foo", "bar");
        assertStrictEquals(app.get("foo"), "bar");
      });
    });
  });

  describe(".setup and .teardown", () => {
    it("app.setup and app.teardown calls .setup and .teardown on all services", async () => {
      const app = feathers();
      let setupCount = 0;
      let teardownCount = 0;

      app.use("/dummy", {
        async setup(appRef: any, path: any) {
          setupCount++;
          assertStrictEquals(appRef, app);
          assertStrictEquals(path, "dummy");
        },

        async teardown(appRef: any, path: any) {
          teardownCount++;
          assertStrictEquals(appRef, app);
          assertStrictEquals(path, "dummy");
        },
      });

      app.use("/simple", {
        get(id: string) {
          return Promise.resolve({ id });
        },
      });

      app.use("/dummy2", {
        async setup(appRef: any, path: any) {
          setupCount++;
          assertStrictEquals(appRef, app);
          assertStrictEquals(path, "dummy2");
        },

        async teardown(appRef: any, path: any) {
          teardownCount++;
          assertStrictEquals(appRef, app);
          assertStrictEquals(path, "dummy2");
        },
      });

      await app.setup();

      assert((app as any)._isSetup);
      assertStrictEquals(setupCount, 2);

      await app.teardown();

      assert(!(app as any)._isSetup);
      assertStrictEquals(teardownCount, 2);
    });

    it("registering app.setup but while still pending will be set up", () => {
      const app = feathers();

      app.setup();

      app.use("/dummy", {
        async setup(appRef: any, path: any) {
          assert((app as any)._isSetup);
          assertStrictEquals(appRef, app);
          assertStrictEquals(path, "dummy");
        },
      });
    });
  });

  describe(".teardown", () => {
    it("app.teardown calls .teardown on all services", async () => {
      const app = feathers();
      let teardownCount = 0;

      app.use("/dummy", {
        async setup() {},
        async teardown(appRef: any, path: any) {
          teardownCount++;
          assertStrictEquals(appRef, app);
          assertStrictEquals(path, "dummy");
        },
      });

      app.use("/simple", {
        get(id: string) {
          return Promise.resolve({ id });
        },
      });

      app.use("/dummy2", {
        async setup() {},
        async teardown(appRef: any, path: any) {
          teardownCount++;
          assertStrictEquals(appRef, app);
          assertStrictEquals(path, "dummy2");
        },
      });

      await app.setup();
      await app.teardown();

      assertEquals((app as any)._isSetup, false);
      assertStrictEquals(teardownCount, 2);
    });
  });

  describe("mixins", () => {
    class Dummy {
      dummy = true;
      async get(id: Id) {
        return { id };
      }
    }

    it("are getting called with a service and default options", () => {
      const app = feathers();
      let mixinRan = false;

      app.mixins.push(function (service: any, location: any, options: any) {
        assert(service.dummy);
        assertStrictEquals(location, "dummy");
        assertEquals(options, getServiceOptions(new Dummy()));
        mixinRan = true;
      });

      app.use("/dummy", new Dummy());

      assert(mixinRan);

      app.setup();
    });

    it("are getting called with a service and service options", () => {
      const app = feathers();
      const opts = { events: ["bla"] };

      let mixinRan = false;

      app.mixins.push(function (service: any, location: any, options: any) {
        assert(service.dummy);
        assertStrictEquals(location, "dummy");
        assertEquals(options, getServiceOptions(new Dummy(), opts));
        mixinRan = true;
      });

      app.use("/dummy", new Dummy(), opts);

      assert(mixinRan);

      app.setup();
    });
  });

  describe("sub apps", () => {
    it("re-registers sub-app services with prefix", (done) => {
      const app = feathers();
      const subApp = feathers();

      subApp
        .use("/service1", {
          async get(id: string) {
            return {
              id,
              name: "service1",
            };
          },
        })
        .use("/service2", {
          async get(id: string) {
            return {
              id,
              name: "service2",
            };
          },

          async create(data: any) {
            return data;
          },
        });

      app.use("/api/", subApp);

      app.service("/api/service2").once("created", async (data: any) => {
        assertEquals(data, {
          message: "This is a test",
        });

        subApp.service("service2").once("created", (data: any) => {
          assertEquals(data, {
            message: "This is another test",
          });
        });

        await app.service("api/service2").create({
          message: "This is another test",
        });
      });
      (async () => {
        let data = await app.service("/api/service1").get(10);
        assertStrictEquals(data.name, "service1");

        data = await app.service("/api/service2").get(1);
        assertStrictEquals(data.name, "service2");

        await subApp.service("service2").create({
          message: "This is a test",
        });
      })();
    });
  });
});
