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
import { Application, feathers, Id, Params } from "../../../feathers/mod.ts";

import { socket as commons, SocketOptions } from "../../src/socket/index.ts";

class DummyService {
  async get(id: Id, params: Params) {
    return { id, params };
  }

  async create(data: any, params: Params) {
    return {
      ...data,
      params,
    };
  }

  async custom(data: any, params: Params) {
    return {
      ...data,
      params,
      message: "From custom method",
    };
  }
}

describe("@feathersjs/transport-commons", () => {
  let provider: EventEmitter;
  let options: SocketOptions;
  let app: Application;
  let connection: any;

  beforeEach(() => {
    connection = { testing: true };
    provider = new EventEmitter();

    options = {
      emit: "emit",
      done: Promise.resolve(provider),
      socketMap: new WeakMap(),
      getParams() {
        return connection;
      },
    };
    app = feathers()
      .configure(commons(options))
      .use("/myservice", new DummyService(), {
        methods: ["get", "create", "custom"],
      });

    return options.done;
  });

  it("`connection` event", () => {
    const socket = new EventEmitter();

    app.once("connection", (data: any) => {
      assertStrictEquals(connection, data);
    });

    provider.emit("connection", socket);
  });

  describe("method name based socket events", () => {
    it(".get without params", () => {
      const socket = new EventEmitter();

      provider.emit("connection", socket);

      socket.emit("get", "myservice", 10, (error: any, result: any) => {
        try {
          assert(!error);
          assertEquals(result, {
            id: 10,
            params: Object.assign(
              {
                query: {},
                route: {},
                connection,
              },
              connection,
            ),
          });
        } catch (e: any) {
          fail(e.message);
        }
      });
    });

    it(".get with invalid service name and arguments", () => {
      const socket = new EventEmitter();

      provider.emit("connection", socket);

      socket.emit("get", null, (error: any) => {
        assertStrictEquals(error.name, "NotFound");
        assertStrictEquals(error.message, "Service 'null' not found");
      });
    });

    it(".create with params", (done) => {
      const socket = new EventEmitter();
      const data = {
        test: "data",
      };

      provider.emit("connection", socket);

      socket.emit(
        "create",
        "myservice",
        data,
        {
          fromQuery: true,
        },
        (error: any, result: any) => {
          try {
            const params = Object.assign(
              {
                query: { fromQuery: true },
                route: {},
                connection,
              },
              connection,
            );

            assert(!error);
            assertEquals(result, Object.assign({ params }, data));
          } catch (e: any) {
            fail(e.message);
          }
        },
      );
    });

    it("custom method with params", () => {
      const socket = new EventEmitter();
      const data = {
        test: "data",
      };

      provider.emit("connection", socket);

      socket.emit(
        "custom",
        "myservice",
        data,
        {
          fromQuery: true,
        },
        (error: any, result: any) => {
          try {
            const params = Object.assign(
              {
                query: { fromQuery: true },
                route: {},
                connection,
              },
              connection,
            );

            assert(!error);
            assertEquals(result, {
              ...data,
              params,
              message: "From custom method",
            });
          } catch (e: any) {
            fail(e.message);
          }
        },
      );
    });
  });
});
