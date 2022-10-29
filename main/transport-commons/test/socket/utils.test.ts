import {
  assert,
  assertEquals,
  assertStrictEquals,
  beforeEach,
  describe,
  fail,
  it,
} from "../../../commons/mod.ts";
import { EventEmitter } from "../../../commons/mod.ts";
import { Application, feathers, Params } from "../../../feathers/mod.ts";
import { NotAuthenticated } from "../../../errors/mod.ts";
import { lodash } from "https://deno.land/x/deno_ts_lodash@0.0.1/mod.ts";

import { routing } from "../../src/routing/index.ts";
import {
  getDispatcher,
  normalizeError,
  runMethod,
} from "../../src/socket/utils.ts";
import { RealTimeConnection } from "../../src/channels/channel/base.ts";

describe("socket commons utils", () => {
  describe(".normalizeError", () => {
    it.ignore("simple error normalization", () => {
      // const message = "Something went wrong";
      // const e = new Error(message);

      // assertEquals(normalizeError(e), {
      //   message,
      //   stack: e.stack.toString(),
      // });
    });

    it("calls .toJSON", () => {
      const json = { message: "toJSON called" };

      assertStrictEquals(
        normalizeError({
          toJSON() {
            return json;
          },
        }),
        json,
      );
    });

    it("removes `hook` property", () => {
      const e = {
        hook: true,
      };

      assertEquals(normalizeError(e), {});
      assert(e.hook, "Does not mutate the original object");
    });

    it.ignore("hides stack in production", () => {
      // const oldEnv = process.env.NODE_ENV;

      // process.env.NODE_ENV = "production";

      // const message = "Something went wrong";
      // const e = new Error(message);
      // const normalized = normalizeError(e);

      // assert.strictEqual(normalized.message, message);
      // assert.ok(!normalized.stack);

      // process.env.NODE_ENV = oldEnv;
    });
  });

  describe(".getDispatcher", () => {
    it("returns a dispatcher function", () =>
      assertStrictEquals(
        typeof getDispatcher("test", new WeakMap()),
        "function",
      ));

    it("works with backwards compatible socketKey", () => {
      const socketKey = Symbol("@feathersjs/test");

      // @ts-ignore
      const dispatcher = getDispatcher("emit", undefined, socketKey);

      const socket = new EventEmitter();

      const connection = {
        [socketKey]: socket,
      };

      const channel: any = {
        connections: [connection],
        dataFor(): null {
          return null;
        },
      };

      socket.once("testing", (data: any) => {
        assertStrictEquals(data, "hi");
      });

      dispatcher("testing", channel, { result: "hi" } as any);
    });

    describe("dispatcher logic", () => {
      let dispatcher: any;
      let dummySocket: EventEmitter;
      let dummyHook: any;
      let dummyChannel: any;
      let dummyConnection: RealTimeConnection;
      let dummyMap: WeakMap<any, any>;

      beforeEach(() => {
        dummyConnection = {};
        dummyMap = new WeakMap();
        dispatcher = getDispatcher("emit", dummyMap);
        dummySocket = new EventEmitter();
        dummyHook = { result: "hi" };
        dummyChannel = {
          connections: [dummyConnection],
          dataFor(): null {
            return null;
          },
        };
        dummyMap.set(dummyConnection, dummySocket);
      });

      it("dispatches a basic event", () => {
        dummySocket.once("testing", (data: any) => {
          assertStrictEquals(data, "hi");
        });

        dispatcher("testing", dummyChannel, dummyHook);
      });

      it("dispatches event on a hooks path event", () => {
        dummyHook.path = "myservice";

        dummySocket.once("myservice testing", (data: any) => {
          assertStrictEquals(data, "hi");
        });

        dispatcher("testing", dummyChannel, dummyHook);
      });

      it("dispatches `hook.dispatch` instead", () => {
        const message = "hi from dispatch";

        dummyHook.dispatch = message;

        dummySocket.once("testing", (data: any) => {
          assertStrictEquals(data, message);
        });

        dispatcher("testing", dummyChannel, dummyHook);
      });

      it("does nothing if there is no socket", () => {
        dummyChannel.connections[0].test = null;

        dispatcher("testing", dummyChannel, dummyHook);
      });

      it("dispatches arrays properly hook events", () => {
        const data1 = { message: "First message" };
        const data2 = { message: "Second message" };

        dummyHook.result = [data1, data2];

        dummySocket.once("testing", (data: any) => {
          assertStrictEquals(data, data1);
          dummySocket.once("testing", (result: any) => {
            assertStrictEquals(result, data2);
          });
        });

        dispatcher("testing", dummyChannel, dummyHook, data1);
        dispatcher("testing", dummyChannel, dummyHook, data2);
      });

      it("dispatches arrays properly for custom events", () => {
        const result = [{ message: "First" }, { message: "Second" }];

        dummyHook.result = result;

        dummySocket.once("otherEvent", (data: any) => {
          assertStrictEquals(data, result);
        });

        dispatcher("otherEvent", dummyChannel, dummyHook, result);
      });
    });
  });

  describe(".runMethod", () => {
    let app: Application;

    beforeEach(() => {
      app = feathers().configure(routing());
      app.use("/myservice", {
        async get(id: number | string, params: Params) {
          if (params.query?.error) {
            throw new NotAuthenticated("None shall pass");
          }
          if (!lodash.isPlainObject(params.query)) {
            throw new Error("Query is not a plain object");
          }

          return { id };
        },
      });
    });

    describe("running methods", () => {
      it("basic", () => {
        const callback = (error: any, result: any) => {
          if (error) {
            return (error);
          }

          assertEquals(result, { id: 10 });
        };

        runMethod(app, {}, "myservice", "get", [10, {}, callback]);
      });

      it("queries are always plain objects", () => {
        const callback = (error: any, result: any) => {
          if (error) {
            return (error);
          }

          assertEquals(result, { id: 10 });
        };

        runMethod(app, {}, "myservice", "get", [
          10,
          {
            __proto__: [],
          },
          callback,
        ]);
      });

      it("merges params with connection and passes connection", () => {
        const connection = {
          testing: true,
        };
        const callback = (error: any, result: any) => {
          if (error) {
            return (error);
          }

          assertEquals(result, {
            id: 10,
            params: {
              connection,
              query: {},
              route: {},
              testing: true,
            },
          });
        };

        app.use("/otherservice", {
          get(id, params) {
            return Promise.resolve({ id, params });
          },
        });

        runMethod(app, connection, "otherservice", "get", [10, {}, callback]);
      });

      it("with params missing", () => {
        const callback = (error: any, result: any) => {
          if (error) {
            return (error);
          }

          assertEquals(result, { id: 10 });
        };

        runMethod(app, {}, "myservice", "get", [10, callback]);
      });

      it("with params but missing callback", () => {
        app.use("/otherservice", {
          get(id: number | string) {
            assertStrictEquals(id, "dishes");

            return Promise.resolve({ id }).then((res) => {
              return res;
            });
          },
        });

        runMethod(app, {}, "otherservice", "get", ["dishes", {}]);
      });

      it("with params and callback missing", () => {
        app.use("/otherservice", {
          get(id: number | string) {
            assertStrictEquals(id, "laundry");

            return Promise.resolve({ id }).then((res) => {
              return res;
            });
          },
        });

        runMethod(app, {}, "otherservice", "get", ["laundry"]);
      });
    });

    it("throws NotFound for invalid service", () => {
      const callback = (error: any) => {
        try {
          assertEquals(error, {
            name: "NotFound",
            message: "Service 'ohmyservice' not found",
            code: 404,
            className: "not-found",
          });
        } catch (e: any) {
          fail(e.message);
        }
      };

      runMethod(app, {}, "ohmyservice", "get", [10, callback]);
    });

    it("throws MethodNotAllowed undefined method", () => {
      const callback = (error: any) => {
        try {
          assertEquals(error, {
            name: "MethodNotAllowed",
            message: "Method 'create' not allowed on service 'myservice'",
            code: 405,
            className: "method-not-allowed",
          });
        } catch (e: any) {
          fail(e.message);
        }
      };

      runMethod(app, {}, "myservice", "create", [{}, callback]);
    });

    it("throws MethodNotAllowed for invalid service method", () => {
      const callback = (error: any) => {
        try {
          assertEquals(error, {
            name: "MethodNotAllowed",
            message: "Method 'blabla' not allowed on service 'myservice'",
            code: 405,
            className: "method-not-allowed",
          });
        } catch (e: any) {
          fail(e.message);
        }
      };

      runMethod(app, {}, "myservice", "blabla", [{}, callback]);
    });

    it("method error calls back with normalized error", () => {
      const callback = (error: any) => {
        try {
          assertEquals(error, {
            name: "NotAuthenticated",
            message: "None shall pass",
            code: 401,
            className: "not-authenticated",
          });
        } catch (e: any) {
          fail(e.message);
        }
      };

      runMethod(app, {}, "myservice", "get", [42, { error: true }, callback]);
    });
  });
});
