import {
  describe,
  it,
  assertStrictEquals,
  unreachable,
  beforeEach,
  assertThrows,
  assertEquals,
} from "../../commons/mod.ts";
import { ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { filterQuery } from "../mod.ts";
import { BadRequest } from "../../errors/mod.ts";

describe("@feathersjs/adapter-commons/filterQuery", () => {
  describe("$sort", () => {
    it("returns $sort when present in query", () => {
      const originalQuery = { $sort: { name: 1 } };
      const { filters, query } = filterQuery(originalQuery);

      assertStrictEquals(filters.$sort.name, 1);
      assertEquals(query, {});
      assertEquals(
        originalQuery,
        {
          $sort: { name: 1 },
        },
        "does not modify original query"
      );
    });

    it("returns $sort when present in query as an object", () => {
      const { filters, query } = filterQuery({
        $sort: { name: { something: 10 } },
      });

      assertStrictEquals(filters.$sort.name.something, 10);
      assertEquals(query, {});
    });

    it("converts strings in $sort", () => {
      const { filters, query } = filterQuery({ $sort: { test: "-1" } });

      assertStrictEquals(filters.$sort.test, -1);
      assertEquals(query, {});
    });

    it("does not convert $sort arrays", () => {
      const $sort = [
        ["test", "-1"],
        ["a", "1"],
      ];
      const { filters, query } = filterQuery({ $sort });

      assertStrictEquals(filters.$sort, $sort);
      assertEquals(query, {});
    });

    it("throws an error when special parameter is not known", () => {
      try {
        const query = { $foo: 1 };
        filterQuery(query);
        unreachable();
      } catch (error: any) {
        assertStrictEquals(error.name, "BadRequest");
        assertStrictEquals(error.message, "Invalid filter value $foo");
      }
    });

    it("returns undefined when not present in query", () => {
      const query = { foo: 1 };
      const { filters } = filterQuery(query);

      assertStrictEquals(filters.$sort, undefined);
    });
  });

  describe("$limit", () => {
    let testQuery: any;

    beforeEach(() => {
      testQuery = { $limit: 1 };
    });

    it("returns $limit when present in query", () => {
      const { filters, query } = filterQuery(testQuery);

      assertStrictEquals(filters.$limit, 1);
      assertEquals(query, {});
    });

    it("returns undefined when not present in query", () => {
      const query = { foo: 1 };
      const { filters } = filterQuery(query);

      assertStrictEquals(filters.$limit, undefined);
    });

    it("removes $limit from query when present", () => {
      assertEquals(filterQuery(testQuery).query, {});
    });

    it("parses $limit strings into integers (#4)", () => {
      const { filters } = filterQuery({ $limit: "2" });

      assertStrictEquals(filters.$limit, 2);
    });

    it("allows $limit 0", () => {
      const { filters } = filterQuery(
        { $limit: 0 },
        { paginate: { default: 10 } }
      );

      assertStrictEquals(filters.$limit, 0);
    });

    describe("pagination", () => {
      it("limits with default pagination", () => {
        const { filters } = filterQuery({}, { paginate: { default: 10 } });
        const { filters: filtersNeg } = filterQuery(
          { $limit: -20 },
          { paginate: { default: 5, max: 10 } }
        );

        assertStrictEquals(filters.$limit, 10);
        assertStrictEquals(filtersNeg.$limit, 5);
      });

      it("limits with max pagination", () => {
        const { filters } = filterQuery(
          { $limit: 20 },
          { paginate: { default: 5, max: 10 } }
        );

        assertStrictEquals(filters.$limit, 10);
      });

      it("limits with default pagination when not a number", () => {
        const { filters } = filterQuery(
          { $limit: "something" },
          { paginate: { default: 5, max: 10 } }
        );

        assertStrictEquals(filters.$limit, 5);
      });

      it("limits to 0 when no paginate.default and not a number", () => {
        const { filters } = filterQuery(
          { $limit: "something" },
          { paginate: { max: 10 } }
        );

        assertStrictEquals(filters.$limit, 0);
      });

      it("still uses paginate.max when there is no paginate.default (#2104)", () => {
        const { filters } = filterQuery(
          { $limit: 100 },
          { paginate: { max: 10 } }
        );

        assertStrictEquals(filters.$limit, 10);
      });
    });
  });

  describe("$skip", () => {
    let testQuery: any;

    beforeEach(() => {
      testQuery = { $skip: 1 };
    });

    it("returns $skip when present in query", () => {
      const { filters } = filterQuery(testQuery);

      assertStrictEquals(filters.$skip, 1);
    });

    it("removes $skip from query when present", () => {
      assertEquals(filterQuery(testQuery).query, {});
    });

    it("returns undefined when not present in query", () => {
      const query = { foo: 1 };
      const { filters } = filterQuery(query);

      assertStrictEquals(filters.$skip, undefined);
    });

    it("parses $skip strings into integers (#4)", () => {
      const { filters } = filterQuery({ $skip: "33" });

      assertStrictEquals(filters.$skip, 33);
    });
  });

  describe("$select", () => {
    let testQuery: any;

    beforeEach(() => {
      testQuery = { $select: 1 };
    });

    it("returns $select when present in query", () => {
      const { filters } = filterQuery(testQuery);

      assertStrictEquals(filters.$select, 1);
    });

    it("removes $select from query when present", () => {
      assertEquals(filterQuery(testQuery).query, {});
    });

    it("returns undefined when not present in query", () => {
      const query = { foo: 1 };
      const { filters } = filterQuery(query);

      assertStrictEquals(filters.$select, undefined);
    });

    it("includes Symbols", () => {
      const TEST = Symbol("testing");
      const original = {
        [TEST]: "message",
        other: true,
        sub: { [TEST]: "othermessage" },
      };

      const { query } = filterQuery(original);

      assertEquals(query, {
        [TEST]: "message",
        other: true,
        sub: { [TEST]: "othermessage" },
      });
    });

    it("only converts plain objects", () => {
      const userId = new ObjectId();
      const original = {
        userId,
      };

      const { query } = filterQuery(original);

      assertEquals(query, original);
    });
  });

  describe("arrays", () => {
    it("validates queries in arrays", () => {
      assertThrows(
        () => {
          filterQuery({
            $or: [{ $exists: false }],
          });
        },
        BadRequest,
        "Invalid query parameter $exists"
      );
    });

    it("allows default operators in $or", () => {
      const { filters } = filterQuery({
        $or: [{ value: { $gte: 10 } }],
      });

      assertEquals(filters, {
        $or: [{ value: { $gte: 10 } }],
      });
    });
  });

  describe("additional filters", () => {
    it("throw error when not set as additionals", () => {
      try {
        filterQuery({ $select: 1, $known: 1 });
        unreachable();
      } catch (error: any) {
        assertStrictEquals(error.message, "Invalid filter value $known");
      }
    });

    it("returns default and known additional filters (array)", () => {
      const query = { $select: ["a", "b"], $known: 1, $unknown: 1 };
      const { filters } = filterQuery(query, {
        filters: {
          $known: true,
          $unknown: true,
        },
      });

      assertStrictEquals(filters.$unknown, 1);
      assertStrictEquals(filters.$known, 1);
      assertEquals(filters.$select, ["a", "b"]);
    });

    it("returns default and known additional filters (object)", () => {
      const { filters } = filterQuery(
        {
          $known: 1,
          $select: 1,
        },
        { filters: { $known: (value: any) => value.toString() } }
      );

      assertStrictEquals(filters.$unknown, undefined);
      assertStrictEquals(filters.$known, "1");
      assertStrictEquals(filters.$select, 1);
    });
  });

  describe("additional operators", () => {
    it("returns query with default and known additional operators", () => {
      const { query } = filterQuery(
        {
          prop: { $ne: 1, $known: 1 },
        },
        { operators: ["$known"] }
      );

      assertEquals(query, { prop: { $ne: 1, $known: 1 } });
    });

    it("throws an error with unknown query operator", () => {
      assertThrows(
        () =>
          filterQuery({
            prop: { $unknown: "something" },
          }),
        "Invalid query parameter $unknown"
      );
    });
  });
});
