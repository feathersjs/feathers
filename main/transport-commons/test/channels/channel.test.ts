import {
  assert,
  assertEquals,
  assertInstanceOf,
  assertStrictEquals,
  beforeEach,
  describe,
  it,
} from "../../../commons/mod.ts";
import { Application, feathers } from "../../../feathers/mod.ts";
import { channels, keys } from "../../src/channels/index.ts";
import {
  Channel,
  RealTimeConnection,
} from "../../src/channels/channel/base.ts";
import { CombinedChannel } from "../../src/channels/channel/combined.ts";

const { CHANNELS } = keys;

describe("app.channel", () => {
  let app: Application;

  beforeEach(() => {
    app = feathers().configure(channels());
  });

  describe("base channels", () => {
    it("creates a new channel, app.channels has names", () => {
      assert(app.channel("test") instanceof Channel);
      assertEquals(app.channels, ["test"]);
    });

    it(".join", () => {
      const test = app.channel("test");
      const c1 = { id: 1 };
      const c2 = { id: 2 };
      const c3 = { id: 3 };

      assertStrictEquals(test.length, 0, "Initial channel is empty");

      test.join(c1);
      test.join(c1);

      assertStrictEquals(test.length, 1, "Joining twice only runs once");

      test.join(c2, c3);

      assertStrictEquals(test.length, 3, "New connections joined");

      test.join(c1, c2, c3);

      assertStrictEquals(test.length, 3, "Joining multiple times does nothing");
    });

    it(".leave", () => {
      const test = app.channel("test");
      const c1 = { id: 1 };
      const c2 = { id: 2 };

      assertStrictEquals(test.length, 0);

      test.join(c1, c2);

      assertStrictEquals(test.length, 2);

      test.leave(c2);
      test.leave(c2);

      assertStrictEquals(test.length, 1);
      assertStrictEquals(test.connections.indexOf(c2), -1);
    });

    it(".leave conditional", () => {
      const test = app.channel("test");
      const c1 = { id: 1, leave: true };
      const c2 = { id: 2 };
      const c3 = { id: 3 };

      test.join(c1, c2, c3);

      assertStrictEquals(test.length, 3);

      test.leave((connection: RealTimeConnection) => connection.leave);

      assertStrictEquals(test.length, 2);
      assertStrictEquals(test.connections.indexOf(c1), -1);
    });

    it(".filter", () => {
      const test = app.channel("test");
      const c1 = { id: 1, filter: true };
      const c2 = { id: 2 };
      const c3 = { id: 3 };

      test.join(c1, c2, c3);

      const filtered = test.filter((connection) => connection.filter);

      assert(filtered !== test, "Returns a new channel instance");
      assert(filtered instanceof Channel);
      assertStrictEquals(filtered.length, 1);
    });

    it(".send", () => {
      const data = { message: "Hi" };

      const test = app.channel("test");
      const withData = test.send(data);

      assert(test !== withData);
      assertStrictEquals(withData.data, data);
    });

    describe("empty channels", () => {
      it("is an EventEmitter", () => {
        const channel = app.channel("emitchannel");

        return new Promise<void>((resolve) => {
          channel.once("message", (data: any) => {
            assertStrictEquals(data, "hello");
            resolve();
          });

          channel.emit("message", "hello");
        });
      });

      it("empty", () => {
        const channel = app.channel("test");
        const c1 = { id: 1 };
        const c2 = { id: 2 };

        // channel.once("empty", done);

        channel.join(c1, c2);
        channel.leave(c1);
        channel.leave(c2);
      });

      it("removes an empty channel", () => {
        const channel = app.channel("test");
        const appChannels = (app as any)[CHANNELS];
        const c1 = { id: 1 };

        channel.join(c1);

        assert(appChannels.test);
        assertStrictEquals(Object.keys(appChannels).length, 1);
        channel.leave(c1);

        assert((app as any)[CHANNELS].test === undefined);
        assertStrictEquals(Object.keys(appChannels).length, 0);
      });

      it("removes all event listeners from an empty channel", () => {
        const channel = app.channel("testing");
        const connection = { id: 1 };

        channel.on("something", () => {});
        assertStrictEquals(channel.listenerCount("something"), 1);
        assertStrictEquals(channel.listenerCount("empty"), 1);

        channel.join(connection).leave(connection);

        assert((app as any)[CHANNELS].testing === undefined);

        assertStrictEquals(channel.listenerCount("something"), 0);
        assertStrictEquals(channel.listenerCount("empty"), 0);
      });
    });
  });

  describe("combined channels", () => {
    it("combines multiple channels", () => {
      const combined = app.channel("test", "again");

      assertEquals(app.channels, ["test", "again"]);
      assertInstanceOf(combined, CombinedChannel);
      assertStrictEquals(combined.length, 0);
    });

    it("de-dupes connections", () => {
      const c1 = { id: 1 };
      const c2 = { id: 2 };

      app.channel("test").join(c1, c2);
      app.channel("again").join(c1);

      const combined = app.channel("test", "again");

      assertInstanceOf(combined, CombinedChannel);
      assertStrictEquals(combined.length, 2);
    });

    it("does nothing when the channel is undefined (#2207)", () => {
      const channel = app.channel("test", "me");

      // @ts-ignore
      channel.join(undefined);
    });

    it(".join all child channels", () => {
      const c1 = { id: 1 };
      const c2 = { id: 2 };

      const combined = app.channel("test", "again");

      combined.join(c1, c2);

      assertStrictEquals(combined.length, 2);
      assertStrictEquals(app.channel("test").length, 2);
      assertStrictEquals(app.channel("again").length, 2);
    });

    it(".leave all child channels", () => {
      const c1 = { id: 1 };
      const c2 = { id: 2 };

      app.channel("test").join(c1, c2);
      app.channel("again").join(c1);

      const combined = app.channel("test", "again");

      combined.leave(c1);

      assertStrictEquals(app.channel("test").length, 1);
      assertStrictEquals(app.channel("again").length, 0);
    });

    it(".leave all child channels conditionally", () => {
      const c1 = { id: 1 };
      const c2 = { id: 2, leave: true };
      const combined = app.channel("test", "again").join(c1, c2);

      combined.leave((connection: RealTimeConnection) => connection.leave);

      assertStrictEquals(app.channel("test").length, 1);
      assertStrictEquals(app.channel("again").length, 1);
    });

    it("app.channel(app.channels)", () => {
      const c1 = { id: 1 };
      const c2 = { id: 2 };

      app.channel("test").join(c1, c2);
      app.channel("again").join(c1);

      const combined = app.channel(app.channels);

      assertEquals(combined.connections, [c1, c2]);
    });
  });
});
