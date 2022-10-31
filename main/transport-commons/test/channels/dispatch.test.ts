/* eslint-disable @typescript-eslint/no-empty-function */
import {
  assertEquals,
  assertNotStrictEquals,
  assertObjectMatch,
  assertStrictEquals,
  beforeEach,
  describe,
  fail,
  it,
  unreachable,
} from "../../../commons/mod.ts";
import { Application, feathers, HookContext } from "../../../feathers/mod.ts";
import { channels } from "../../src/channels/index.ts";
import { Channel } from "../../src/channels/channel/base.ts";
import { CombinedChannel } from "../../src/channels/channel/combined.ts";

class TestService {
  events = ["foo"];

  async create(payload: any) {
    return payload;
  }
}

describe("app.publish", () => {
  let app: Application;

  beforeEach(() => {
    app = feathers().configure(channels());
  });

  it("throws an error if service does not send the event", () => {
    try {
      app.use("/test", {
        create(data: any) {
          return Promise.resolve(data);
        },
      });

      app.service("test").registerPublisher("created", function () {});
      app.service("test").registerPublisher("bla", function () {});
      unreachable();
    } catch (e: any) {
      assertStrictEquals(e.message, "'bla' is not a valid service event");
    }
  });

  describe("registration and `dispatch` event", () => {
    const c1 = { id: 1, test: true };
    const c2 = { id: 2, test: true };
    const data = { message: "This is a test" };

    beforeEach(() => {
      app.use("/test", new TestService());
    });

    it("error in publisher is handled gracefully (#1707)", async () => {
      app.service("test").publish("created", () => {
        throw new Error("Something went wrong");
      });

      try {
        await app.service("test").create({ message: "something" });
      } catch (error: any) {
        fail(error.message);
      }
    });

    it("simple event registration and dispatching", () => {
      app.channel("testing").join(c1);

      app.service("test").registerPublisher(
        "created",
        () => app.channel("testing"),
      );

      app.once(
        "publish",
        (event: string, channel: Channel, hook: HookContext) => {
          try {
            assertStrictEquals(event, "created");
            assertStrictEquals(hook.path, "test");
            assertStrictEquals(hook.result, data);
            assertEquals(channel.connections, [c1]);
          } catch (error: any) {
            fail(error.message);
          }
        },
      );

      app.service("test").create(data).catch(fail);
    });

    it("app and global level dispatching and precedence", () => {
      app.channel("testing").join(c1);
      app.channel("other").join(c2);

      app.registerPublisher("created", () => app.channel("testing"));
      app.registerPublisher(() => app.channel("other"));

      app.once("publish", (_event: string, channel: Channel) => {
        assertNotStrictEquals(channel.connections.indexOf(c1), -1);
      });

      app.service("test").create(data).catch(fail);
    });

    it("promise event dispatching", () => new Promise((resolve) =>{
      app.channel("testing").join(c1);
      app.channel("othertest").join(c2);

      app
        .service("test")
        .registerPublisher(
          "created",
          () =>
            new Promise((resolve) =>
              setTimeout(
                () => resolve(app.channel("testing")),
                50,
              )
            ),
        );
      app
        .service("test")
        .registerPublisher(
          "created",
          () =>
            new Promise((resolve) =>
              setTimeout(
                () => resolve(app.channel("testing", "othertest")),
                100,
              )
            ),
        );

      app.once(
        "publish",
        (_event: string, channel: Channel, hook: HookContext) => {
          assertStrictEquals(hook.result, data);
          assertEquals(channel.connections, [c1, c2]);
          resolve();
        },
      );

      app.service("test").create(data).catch(fail);
    }));

    it("custom event dispatching", () => {
      const eventData = { testing: true };

      app.channel("testing").join(c1);
      app.channel("othertest").join(c2);

      app.service("test").registerPublisher(
        "foo",
        () => app.channel("testing"),
      );

      app.once(
        "publish",
        (event: string, channel: Channel, hook: HookContext) => {
          assertStrictEquals(event, "foo");
          assertObjectMatch(hook, {
            app,
            path: "test",
            service: app.service("test"),
            result: eventData,
          });
          assertEquals(channel.connections, [c1]);
        },
      );

      app.service("test").emit("foo", eventData);
    });

    it("does not sent `dispatch` event if there are no dispatchers", () =>
      new Promise((resolve) => {
        app.once("publish", () => unreachable());

        globalThis.addEventListener(
          "unhandledrejection",
          () => fail("Unhandled Rejection"),
        );

        app
          .service("test")
          .create(data)
          .then(resolve)
          .catch(fail);
      }));

    it("does not send `dispatch` event if there are no connections", () =>
      new Promise((resolve) => {
        app.service("test").registerPublisher(
          "created",
          () => app.channel("dummy"),
        );

        app.once("publish", () => fail("Should never get here"));

        app
          .service("test")
          .create(data)
          .then(resolve)
          .catch(fail);
      }));

    it("dispatcher returning an array of channels", () => {
      app.channel("testing").join(c1);
      app.channel("othertest").join(c2);

      app
        .service("test")
        .registerPublisher(
          "created",
          () => [app.channel("testing"), app.channel("othertest")],
        );

      app.once(
        "publish",
        (_event: string, channel: Channel, hook: HookContext) => {
          assertStrictEquals(hook.result, data);
          assertEquals(channel.connections, [c1, c2]);
        },
      );

      app.service("test").create(data).catch(fail);
    });

    it("dispatcher can send data", () => {
      const c1data = { channel: "testing" };

      app.channel("testing").join(c1);
      app.channel("othertest").join(c2);

      app
        .service("test")
        .registerPublisher(
          "created",
          () => [app.channel("testing").send(c1data), app.channel("othertest")],
        );

      app.once(
        "publish",
        (_event: string, channel: CombinedChannel, hook: HookContext) => {
          assertStrictEquals(hook.result, data);
          assertStrictEquals(channel.dataFor(c1), c1data);
          assertStrictEquals(channel.dataFor(c2), null);
          assertEquals(channel.connections, [c1, c2]);
        },
      );

      app.service("test").create(data).catch(fail);
    });

    it("publisher precedence and preventing publishing", (done) => {
      app.channel("test").join(c1);

      app.registerPublisher(() => app.channel("test"));
      // @ts-ignore
      app.service("test").registerPublisher("created", (): null => null);

      app.once("publish", () => fail("Should never get here"));

      app
        .service("test")
        .create(data)
        .catch(fail);
    });

    it("data of first channel has precedence", () => {
      const sendData = { test: true };

      app.channel("testing").join(c1);
      app.channel("othertest").join(c1);

      app.service("test").registerPublisher("created", () => {
        return [
          app.channel("testing"),
          app.channel("othertest").send(sendData),
        ];
      });

      app.once("publish", (_event: string, channel: CombinedChannel) => {
        assertStrictEquals(channel.dataFor(c1), null);
        assertEquals(channel.connections, [c1]);
      });

      app.service("test").create(data).catch(fail);
    });
  });
});
