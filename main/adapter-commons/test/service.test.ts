/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment */
import {
  describe,
  it,
  assertRejects,
  assertStrictEquals,
  assertEquals,
} from "../../commons/mod.ts";
import { MethodNotAllowed } from "../../errors/mod.ts";
import { createContext } from "../../feathers/mod.ts";
import { MethodService } from "./fixture.ts";

const METHODS: ["find", "get", "create", "update", "patch", "remove"] = [
  "find",
  "get",
  "create",
  "update",
  "patch",
  "remove",
];

describe("@feathersjs/adapter-commons/service", () => {
  describe("works when methods exist", () => {
    METHODS.forEach((method) => {
      it(`${method}`, () => {
        const service = new MethodService({});
        const args = [];

        if (method !== "find") {
          args.push("test");
        }

        if (method === "update" || method === "patch") {
          args.push({});
        }

        // @ts-ignore
        service[method](...args);
      });
    });

    it("does not allow multi patch", async () => {
      const service = new MethodService({});

      await assertRejects(
        () => service.patch(null, {}),
        MethodNotAllowed,
        "Can not patch multiple entries"
      );
    });

    it("does not allow multi remove", async () => {
      const service = new MethodService({});

      await assertRejects(
        () => service.remove(null, {}),
        MethodNotAllowed,
        "Can not remove multiple entries"
      );
    });

    it("does not allow multi create", async () => {
      const service = new MethodService({});

      await assertRejects(
        () => service.create([], {}),
        MethodNotAllowed,
        "Can not create multiple entries"
      );
    });

    it("multi can be set to true", async () => {
      const service = new MethodService({});

      service.options.multi = true;

      await service.create([]);
    });
  });

  it("sanitizeQuery", async () => {
    const service = new MethodService({
      filters: {
        $something: true,
      },
      operators: ["$test"],
    });

    assertEquals(
      await service.sanitizeQuery({
        // @ts-ignore
        query: { $limit: "10", test: "me" },
      }),
      { $limit: 10, test: "me" }
    );

    assertEquals(
      await service.sanitizeQuery({
        adapter: {
          paginate: { max: 2 },
        },
        query: { $limit: "10", test: "me" } as any,
      }),
      { $limit: 2, test: "me" }
    );

    await assertRejects(
      () =>
        service.sanitizeQuery({
          query: { name: { $bla: "me" } },
        }),
      "Invalid query parameter $bla"
    );

    assertEquals(
      await service.sanitizeQuery({
        adapter: {
          operators: ["$bla"],
        },
        query: { name: { $bla: "Dave" } },
      }),
      { name: { $bla: "Dave" } }
    );
  });

  it("getOptions", () => {
    const service = new MethodService({
      multi: true,
      paginate: {
        default: 1,
        max: 10,
      },
    });
    const opts = service.getOptions({
      adapter: {
        multi: ["create"],
        paginate: {
          default: 10,
          max: 100,
        },
      },
    });

    assertEquals(opts, {
      id: "id",
      events: [],
      paginate: { default: 10, max: 100 },
      multi: ["create"],
      filters: {},
      operators: [],
    });

    const notPaginated = service.getOptions({
      paginate: false,
    });

    assertEquals(notPaginated, {
      id: "id",
      events: [],
      paginate: false,
      multi: true,
      filters: {},
      operators: [],
    });
  });

  describe("allowsMulti", () => {
    describe("with true", () => {
      const service = new MethodService({ multi: true });

      it("does return true for multiple methodes", () => {
        assertEquals(service.allowsMulti("patch"), true);
      });

      it("does return false for always non-multiple methodes", () => {
        assertEquals(service.allowsMulti("update"), false);
      });

      it("does return true for unknown methods", () => {
        assertEquals(service.allowsMulti("other"), true);
      });
    });

    describe("with false", () => {
      const service = new MethodService({ multi: false });

      it("does return false for multiple methodes", () => {
        assertEquals(service.allowsMulti("remove"), false);
      });

      it("does return true for always multiple methodes", () => {
        assertEquals(service.allowsMulti("find"), true);
      });

      it("does return false for unknown methods", () => {
        assertEquals(service.allowsMulti("other"), false);
      });
    });

    describe("with array", () => {
      const service = new MethodService({ multi: ["create", "get", "other"] });

      it("does return true for specified multiple methodes", () => {
        assertEquals(service.allowsMulti("create"), true);
      });

      it("does return false for non-specified multiple methodes", () => {
        assertEquals(service.allowsMulti("patch"), false);
      });

      it("does return false for specified always multiple methodes", () => {
        assertEquals(service.allowsMulti("get"), false);
      });

      it("does return true for specified unknown methodes", () => {
        assertEquals(service.allowsMulti("other"), true);
      });

      it("does return false for non-specified unknown methodes", () => {
        assertEquals(service.allowsMulti("another"), false);
      });
    });
  });
});
