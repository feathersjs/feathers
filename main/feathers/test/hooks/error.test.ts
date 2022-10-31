// deno-lint-ignore-file require-await
import {
  describe,
  it,
  afterEach,
  assertEquals,
  assertRejects,
  assertStrictEquals,
  assert,
  beforeEach,
  assertObjectMatch,
} from "../../../commons/mod.ts";
import { feathers, Application, FeathersService } from "../../mod.ts";

describe("`error` hooks", () => {
  describe("on direct service method errors", () => {
    const errorMessage = "Something else went wrong";
    const app = feathers().use("/dummy", {
      async get() {
        throw new Error("Something went wrong");
      },
    });
    const service = app.service("dummy");

    afterEach(() => {
      const s = service as any;

      s.__hooks.error.get = undefined;
      s.__hooks.collected.get = [];
    });

    it("basic error hook", async () => {
      service.hooks({
        error: {
          get(context) {
            assertStrictEquals(context.type, "error");
            assertStrictEquals(context.id, "test");
            assertStrictEquals(context.method, "get");
            assertStrictEquals(context.app, app);
            assertStrictEquals(context.error.message, "Something went wrong");
          },
        },
      });

      await assertRejects(() => service.get("test"), "Something went wrong");
    });

    it("can change the error", async () => {
      service.hooks({
        error: {
          get(context) {
            context.error = new Error(errorMessage);
          },
        },
      });

      await assertRejects(() => service.get("test"), errorMessage);
    });

    it("throwing an error", async () => {
      service.hooks({
        error: {
          get() {
            throw new Error(errorMessage);
          },
        },
      });

      await assertRejects(() => service.get("test"), errorMessage);
    });

    it("rejecting a promise", async () => {
      service.hooks({
        error: {
          async get() {
            throw new Error(errorMessage);
          },
        },
      });

      await assertRejects(() => service.get("test"), errorMessage);
    });

    it("can chain multiple hooks", async () => {
      service.hooks({
        error: {
          get: [
            function (context) {
              context.error = new Error(errorMessage);
              context.error.first = true;
            },

            function (context) {
              context.error.second = true;

              return Promise.resolve(context);
            },

            function (context) {
              context.error.third = true;

              return context;
            },
          ],
        },
      });

      const err: any = await assertRejects(
        () => service.get("test"),
        errorMessage
      );

      assertObjectMatch(err, {
        first: true,
        second: true,
        third: true,
      });
    });

    it("setting `context.result` will return result", async () => {
      const data = {
        message: "It worked",
      };

      service.hooks({
        error: {
          get(context) {
            context.result = data;
          },
        },
      });

      const result = await service.get(10);

      assertEquals(result, data);
    });

    it("allows to set `context.result = null` in error hooks (#865)", async () => {
      const app = feathers().use("/dummy", {
        async get() {
          throw new Error("Damnit");
        },
      });

      app.service("dummy").hooks({
        error: {
          get(context: any) {
            context.result = null;
          },
        },
      });

      const result = await app.service("dummy").get(1);

      assertStrictEquals(result, null);
    });

    it("uses the current hook object if thrown in a service method", async () => {
      const app = feathers().use("/dummy", {
        async get() {
          throw new Error("Something went wrong");
        },
      });
      const service = app.service("dummy");

      service.hooks({
        before(context) {
          context.id = 42;
        },
        error(context) {
          assertStrictEquals(context.id, 42);
        },
      });

      await assertRejects(() => service.get(1), "Something went wrong");
    });
  });

  describe("error in hooks", () => {
    const errorMessage = "before hook broke";

    let app: Application;
    let service: FeathersService;

    beforeEach(() => {
      app = feathers().use("/dummy", {
        async get(id: any) {
          return {
            id,
            text: `You have to do ${id}`,
          };
        },
      });

      service = app.service("dummy");
    });

    it("in before hook", async () => {
      service
        .hooks({
          before() {
            throw new Error(errorMessage);
          },
        })
        .hooks({
          error(context) {
            assertStrictEquals(
              context.original.type,
              "before",
              "Original hook still set"
            );
            assertStrictEquals(context.id, "dishes");
            assertStrictEquals(context.error.message, errorMessage);
          },
        });

      await assertRejects(() => service.get("dishes"), errorMessage);
    });

    it("in after hook", async () => {
      service.hooks({
        after() {
          throw new Error(errorMessage);
        },

        error(context) {
          assertStrictEquals(
            context.original.type,
            "after",
            "Original hook still set"
          );
          assertStrictEquals(context.id, "dishes");
          assertEquals(context.original.result, {
            id: "dishes",
            text: "You have to do dishes",
          });
          assertStrictEquals(context.error.message, errorMessage);
        },
      });

      await assertRejects(() => service.get("dishes"), errorMessage);
    });

    it("uses the current hook object if thrown in a hook and sets context.original", async () => {
      service.hooks({
        after(context) {
          context.modified = true;

          throw new Error(errorMessage);
        },

        error(context) {
          assert(context.modified);
          assertStrictEquals(context.original.type, "after");
        },
      });

      await assertRejects(() => service.get("laundry"), errorMessage);
    });
  });

  it("Error in before hook causes inter-service calls to have wrong hook context (#841)", async () => {
    const app = feathers();

    let service1Params: any;
    let service2Params: any;

    app.use("/service1", {
      async find() {
        return { message: "service1 success" };
      },
    });

    app.service("service1").hooks({
      before(context: any) {
        service1Params = context.params;
        throw new Error("Error in service1 before hook");
      },
    });

    app.use("/service2", {
      async find() {
        await app.service("/service1").find({});

        return { message: "service2 success" };
      },
    });

    app.service("service2").hooks({
      before(context: any) {
        service2Params = context.params;
        context.params.foo = "bar";
      },
      error(context: any) {
        assert(service1Params !== context.params);
        assert(service2Params === context.params);
        assertStrictEquals(context.path, "service2");
        assertStrictEquals(context.params.foo, "bar");
      },
    });

    await assertRejects(
      () => app.service("/service2").find(),
      "Error in service1 before hook"
    );
  });
});
