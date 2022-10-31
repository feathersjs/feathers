import {
  afterEach,
  assert,
  assertEquals,
  assertRejects,
  assertStrictEquals,
  beforeEach,
  describe,
} from "../../commons/mod.ts";
import { AdapterSyntaxTest } from "./declarations.ts";

export default (
  test: AdapterSyntaxTest,
  app: any,
  _errors: any,
  serviceName: string,
  idProp: string,
) => {
  describe("Query Syntax", () => {
    let bob: any;
    let alice: any;
    let doug: any;
    let service: any;

    beforeEach(async () => {
      service = app.service(serviceName);
      bob = await app.service(serviceName).create({
        name: "Bob",
        age: 25,
      });
      doug = await app.service(serviceName).create({
        name: "Doug",
        age: 32,
      });
      alice = await app.service(serviceName).create({
        name: "Alice",
        age: 19,
      });
    });

    afterEach(async () => {
      await service.remove(bob[idProp]);
      await service.remove(alice[idProp]);
      await service.remove(doug[idProp]);
    });

    test(".find + equal", async () => {
      const params = { query: { name: "Alice" } };
      const data = await service.find(params);

      assert(Array.isArray(data));
      assertStrictEquals(data.length, 1);
      assertStrictEquals(data[0].name, "Alice");
    });

    test(".find + equal multiple", async () => {
      const data = await service.find({
        query: { name: "Alice", age: 20 },
      });

      assertStrictEquals(data.length, 0);
    });

    describe("special filters", () => {
      test(".find + $sort", async () => {
        let data = await service.find({
          query: {
            $sort: { name: 1 },
          },
        });

        assertStrictEquals(data.length, 3);
        assertStrictEquals(data[0].name, "Alice");
        assertStrictEquals(data[1].name, "Bob");
        assertStrictEquals(data[2].name, "Doug");

        data = await service.find({
          query: {
            $sort: { name: -1 },
          },
        });

        assertStrictEquals(data.length, 3);
        assertStrictEquals(data[0].name, "Doug");
        assertStrictEquals(data[1].name, "Bob");
        assertStrictEquals(data[2].name, "Alice");
      });

      test(".find + $sort + string", async () => {
        const data = await service.find({
          query: {
            $sort: { name: "1" },
          },
        });

        assertStrictEquals(data.length, 3);
        assertStrictEquals(data[0].name, "Alice");
        assertStrictEquals(data[1].name, "Bob");
        assertStrictEquals(data[2].name, "Doug");
      });

      test(".find + $limit", async () => {
        const data = await service.find({
          query: {
            $limit: 2,
          },
        });

        assertStrictEquals(data.length, 2);
      });

      test(".find + $limit 0", async () => {
        const data = await service.find({
          query: {
            $limit: 0,
          },
        });

        assertStrictEquals(data.length, 0);
      });

      test(".find + $skip", async () => {
        const data = await service.find({
          query: {
            $sort: { name: 1 },
            $skip: 1,
          },
        });

        assertStrictEquals(data.length, 2);
        assertStrictEquals(data[0].name, "Bob");
        assertStrictEquals(data[1].name, "Doug");
      });

      test(".find + $select", async () => {
        const data = await service.find({
          query: {
            name: "Alice",
            $select: ["name"],
          },
        });

        assertStrictEquals(data.length, 1);
        assertStrictEquals(data[0].name, "Alice");
        assertStrictEquals(data[0].age, undefined);
      });

      test(".find + $or", async () => {
        const data = await service.find({
          query: {
            $or: [{ name: "Alice" }, { name: "Bob" }],
            $sort: { name: 1 },
          },
        });

        assertStrictEquals(data.length, 2);
        assertStrictEquals(data[0].name, "Alice");
        assertStrictEquals(data[1].name, "Bob");
      });

      test(".find + $in", async () => {
        const data = await service.find({
          query: {
            name: {
              $in: ["Alice", "Bob"],
            },
            $sort: { name: 1 },
          },
        });

        assertStrictEquals(data.length, 2);
        assertStrictEquals(data[0].name, "Alice");
        assertStrictEquals(data[1].name, "Bob");
      });

      test(".find + $nin", async () => {
        const data = await service.find({
          query: {
            name: {
              $nin: ["Alice", "Bob"],
            },
          },
        });

        assertStrictEquals(data.length, 1);
        assertStrictEquals(data[0].name, "Doug");
      });

      test(".find + $lt", async () => {
        const data = await service.find({
          query: {
            age: {
              $lt: 30,
            },
          },
        });

        assertStrictEquals(data.length, 2);
      });

      test(".find + $lte", async () => {
        const data = await service.find({
          query: {
            age: {
              $lte: 25,
            },
          },
        });

        assertStrictEquals(data.length, 2);
      });

      test(".find + $gt", async () => {
        const data = await service.find({
          query: {
            age: {
              $gt: 30,
            },
          },
        });

        assertStrictEquals(data.length, 1);
      });

      test(".find + $gte", async () => {
        const data = await service.find({
          query: {
            age: {
              $gte: 25,
            },
          },
        });

        assertStrictEquals(data.length, 2);
      });

      test(".find + $ne", async () => {
        const data = await service.find({
          query: {
            age: {
              $ne: 25,
            },
          },
        });

        assertStrictEquals(data.length, 2);
      });
    });

    test(".find + $gt + $lt + $sort", async () => {
      const params = {
        query: {
          age: {
            $gt: 18,
            $lt: 30,
          },
          $sort: { name: 1 },
        },
      };

      const data = await service.find(params);

      assertStrictEquals(data.length, 2);
      assertStrictEquals(data[0].name, "Alice");
      assertStrictEquals(data[1].name, "Bob");
    });

    test(".find + $or nested + $sort", async () => {
      const params = {
        query: {
          $or: [
            { name: "Doug" },
            {
              age: {
                $gte: 18,
                $lt: 25,
              },
            },
          ],
          $sort: { name: 1 },
        },
      };

      const data = await service.find(params);

      assertStrictEquals(data.length, 2);
      assertStrictEquals(data[0].name, "Alice");
      assertStrictEquals(data[1].name, "Doug");
    });

    describe("params.adapter", () => {
      test("params.adapter + paginate", async () => {
        const page = await service.find({
          adapter: {
            paginate: { default: 3 },
          },
        });

        assertStrictEquals(page.limit, 3);
        assertStrictEquals(page.skip, 0);
      });

      test("params.adapter + multi", async () => {
        const items = [
          {
            name: "Garald",
            age: 200,
          },
          {
            name: "Harald",
            age: 24,
          },
        ];
        const multiParams = {
          adapter: {
            multi: ["create"],
          },
        };
        const users = await service.create(items, multiParams);

        assertStrictEquals(users.length, 2);

        await service.remove(users[0][idProp]);
        await service.remove(users[1][idProp]);
        await assertRejects(
          () => service.patch(null, { age: 2 }, multiParams),"Can not patch multiple entries",
        );
      });
    });

    describe("paginate", function () {
      beforeEach(() => {
        service.options.paginate = {
          default: 1,
          max: 2,
        };
      });

      afterEach(() => {
        service.options.paginate = {};
      });

      test(".find + paginate", async () => {
        const page = await service.find({
          query: { $sort: { name: -1 } },
        });

        assertStrictEquals(page.total, 3);
        assertStrictEquals(page.limit, 1);
        assertStrictEquals(page.skip, 0);
        assertStrictEquals(page.data[0].name, "Doug");
      });

      test(".find + paginate + query", async () => {
        const page = await service.find({
          query: {
            $sort: { name: -1 },
            name: "Doug",
          },
        });

        assertStrictEquals(page.total, 1);
        assertStrictEquals(page.limit, 1);
        assertStrictEquals(page.skip, 0);
        assertStrictEquals(page.data[0].name, "Doug");
      });

      test(".find + paginate + $limit + $skip", async () => {
        const params = {
          query: {
            $skip: 1,
            $limit: 4,
            $sort: { name: -1 },
          },
        };

        const page = await service.find(params);

        assertStrictEquals(page.total, 3);
        assertStrictEquals(page.limit, 2);
        assertStrictEquals(page.skip, 1);
        assertStrictEquals(page.data[0].name, "Bob");
        assertStrictEquals(page.data[1].name, "Alice");
      });

      test(".find + paginate + $limit 0", async () => {
        const page = await service.find({
          query: { $limit: 0 },
        });

        assertStrictEquals(page.total, 3);
        assertStrictEquals(page.data.length, 0);
      });

      test(".find + paginate + params", async () => {
        const page = await service.find({ paginate: { default: 3 } });

        assertStrictEquals(page.limit, 3);
        assertStrictEquals(page.skip, 0);

        const results = await service.find({ paginate: false });

        assert(Array.isArray(results));
        assertStrictEquals(results.length, 3);
      });
    });
  });
};
