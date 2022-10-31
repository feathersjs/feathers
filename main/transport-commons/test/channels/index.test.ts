import {
  assert,
  assertStrictEquals,
  describe,
  it,
  unreachable,
} from "../../../commons/mod.ts";
import { feathers } from "../../../feathers/mod.ts";
import { channels, keys } from "../../src/channels/index.ts";

describe("feathers-channels", () => {
  it("has app.channel", () => {
    const app = feathers().configure(channels());

    assertStrictEquals(typeof app.channel, "function");
    assertStrictEquals(typeof (app as any)[keys.CHANNELS], "object");
    assertStrictEquals(app.channels.length, 0);
  });

  it("throws an error when called with nothing", () => {
    const app = feathers().configure(channels());

    try {
      app.channel();
      unreachable;
    } catch (e: any) {
      assertStrictEquals(
        e.message,
        "app.channel needs at least one channel name",
      );
    }
  });

  it("configuring twice does nothing", () => {
    feathers().configure(channels()).configure(channels());
  });

  it("does not add things to the service if `dispatch` exists", () => {
    const app = feathers()
      .configure(channels())
      .use("/test", {
        async setup() {},
        publish() {
          return this;
        },
      } as any);

    const service: any = app.service("test");

    assert(!service[keys.PUBLISHERS]);
  });
});
