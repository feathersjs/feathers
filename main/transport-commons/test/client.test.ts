import {
  assert,
  assertEquals,
  assertObjectMatch,
  assertRejects,
  assertStrictEquals,
  beforeEach,
  describe,
  it,
  unreachable,
} from "../../commons/mod.ts";
import { EventEmitter } from "../../commons/mod.ts";
import { CustomMethods } from "../../feathers/mod.ts";
import { NotAuthenticated } from "../../errors/mod.ts";
import { Service, SocketService } from "../src/client.ts";

declare type DummyCallback = (err: any, data?: any) => void;

describe("client", () => {
  let connection: any;
  let testData: any;
  let service:
    & SocketService
    & CustomMethods<{ customMethod: any }>
    & EventEmitter;

  beforeEach(() => {
    connection = new EventEmitter();
    testData = { data: "testing " };
    service = new Service({
      events: ["created"],
      name: "todos",
      method: "emit",
      connection,
    }) as any;
  });

  it("sets `events` property on service", () => {
    assert(service.events);
  });

  it("throws an error when the emitter does not have the method", () => {
    const clientService = new Service({
      name: "todos",
      method: "emit",
      connection: {},
    }) as Service & EventEmitter;

    try {
      clientService.eventNames();
      unreachable();
    } catch (e: any) {
      assertStrictEquals(
        e.message,
        "Can not call 'eventNames' on the client service connection",
      );
    }

    try {
      clientService.on("test", () => {});
      unreachable();
    } catch (e: any) {
      assertStrictEquals(
        e.message,
        "Can not call 'on' on the client service connection",
      );
    }
  });

  it("allows chaining event listeners", () => {
    assertStrictEquals(
      service,
      service.on("thing", () => {}),
    );
    assertStrictEquals(
      service,
      service.once("other thing", () => {}),
    );
  });

  it("initializes and emits namespaced events", () => {
    connection.once("todos test", (data: any) => {
      assertStrictEquals(data, testData);
    });
    service.emit("test", testData);
  });

  it("has other emitter methods", () => {
    assert(service.eventNames());
  });

  it("can receive pathed events", () => {
    service.once("thing", (data: any) => {
      assertStrictEquals(data, testData);
    });

    connection.emit("todos thing", testData);
  });

  it("sends all service and custom methods with acknowledgement", async () => {
    const idCb = (_path: any, id: any, _params: any, callback: DummyCallback) =>
      callback(null, { id });

    const idDataCb = (
      _path: any,
      _id: any,
      data: any,
      _params: any,
      callback: DummyCallback,
    ) => callback(null, data);

    const dataCb = (
      _path: any,
      data: any,
      _params: any,
      callback: DummyCallback,
    ) => {
      data.created = true;
      callback(null, data);
    };

    connection.once("create", dataCb);
    service.methods("customMethod");

    let res = await service.create(testData);

    assert(res.created);

    connection.once("get", idCb);
    res = await service.get(1);
    assertEquals(res, { id: 1 });

    connection.once("remove", idCb);
    res = await service.remove(12);
    assertEquals(res, { id: 12 });

    connection.once("update", idDataCb);
    res = await service.update(12, testData);
    assertStrictEquals(res, testData);

    connection.once("patch", idDataCb);
    res = await service.patch(12, testData);
    assertStrictEquals(res, testData);

    connection.once("customMethod", dataCb);
    res = await service.customMethod({ message: "test" });
    assertEquals(res, {
      created: true,
      message: "test",
    });

    connection.once(
      "find",
      (_path: any, params: any, callback: DummyCallback) =>
        callback(null, { params }),
    );

    res = await service.find({ query: { test: true } });
    assertEquals(res, {
      params: { test: true },
    });
  });

  it("converts to feathers-errors (#19)", async () => {
    connection.once(
      "create",
      (_path: any, _data: any, _params: any, callback: DummyCallback) =>
        callback(new NotAuthenticated("Test", { hi: "me" }).toJSON()),
    );

    const error = await assertRejects(
      () => service.create(testData),
      NotAuthenticated,
      "Test",
    );

    assertObjectMatch(error, {
      name: "NotAuthenticated",
      message: "Test",
      code: 401,
      data: { hi: "me" },
    });
  });

  it("converts other errors (#19)", async () => {
    connection.once(
      "create",
      (
        _path: string,
        _data: any,
        _params: any,
        callback: (x: string) => void,
      ) => {
        callback("Something went wrong"); // eslint-disable-line
      },
    );

    await assertRejects(() => service.create(testData), "Something went wrong");
  });

  it("has all EventEmitter methods", () => {
    const testing = { hello: "world" };
    const callback = (data: any) => {
      assertStrictEquals(data, testing);
      assertStrictEquals(service.listenerCount("test"), 1);
      service.removeListener("test", callback);
      assertStrictEquals(service.listenerCount("test"), 0);
    };

    service.addListener("test", callback);

    connection.emit("todos test", testing);
  });

  it("properly handles on/off methods", () => {
    const testing = { hello: "world" };

    const callback1 = (data: any) => {
      assertStrictEquals(data, testing);
      assertStrictEquals(service.listenerCount("test"), 3);
      service.off("test", callback1);
      assertStrictEquals(service.listenerCount("test"), 2);
      service.removeAllListeners("test");
      assertStrictEquals(service.listenerCount("test"), 0);
    };
    const callback2 = () => {
      // noop
    };

    service.on("test", callback1);
    service.on("test", callback2);
    service.on("test", callback2);

    connection.emit("todos test", testing);
  });

  it("forwards namespaced call to .off, returns service instance", () => {
    // Use it's own connection and service so off method gets detected
    const conn = new EventEmitter();

    // @ts-ignore
    conn.off = function (name) {
      assertStrictEquals(name, "todos test");

      return this;
    };

    const client = new Service({
      name: "todos",
      method: "emit",
      connection: conn,
    });

    assertStrictEquals(client.off("test"), client);
  });
});
