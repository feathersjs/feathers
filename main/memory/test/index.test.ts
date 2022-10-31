import {
  assert,
  assertEquals,
  assertStrictEquals,
  describe,
  it,
} from "../../commons/mod.ts";
import adapterTests from "../../adapter-tests/mod.ts";
import { errors } from "../../errors/mod.ts";
import { feathers } from "../../feathers/mod.ts";

import { MemoryService } from "../mod.ts";

const testSuite = adapterTests([
  ".options",
  ".events",
  "._get",
  "._find",
  "._create",
  "._update",
  "._patch",
  "._remove",
  ".$get",
  ".$find",
  ".$create",
  ".$update",
  ".$patch",
  ".$remove",
  ".get",
  ".get + $select",
  ".get + id + query",
  ".get + NotFound",
  ".get + id + query id",
  ".find",
  ".find + paginate + query",
  ".remove",
  ".remove + $select",
  ".remove + id + query",
  ".remove + multi",
  ".remove + multi no pagination",
  ".remove + id + query id",
  ".update",
  ".update + $select",
  ".update + id + query",
  ".update + NotFound",
  ".update + id + query id",
  ".update + query + NotFound",
  ".patch",
  ".patch + $select",
  ".patch + id + query",
  ".patch multiple",
  ".patch multiple no pagination",
  ".patch multi query same",
  ".patch multi query changed",
  ".patch + query + NotFound",
  ".patch + NotFound",
  ".patch + id + query id",
  ".create",
  ".create + $select",
  ".create multi",
  "internal .find",
  "internal .get",
  "internal .create",
  "internal .update",
  "internal .patch",
  "internal .remove",
  ".find + equal",
  ".find + equal multiple",
  ".find + $sort",
  ".find + $sort + string",
  ".find + $limit",
  ".find + $limit 0",
  ".find + $skip",
  ".find + $select",
  ".find + $or",
  ".find + $in",
  ".find + $nin",
  ".find + $lt",
  ".find + $lte",
  ".find + $gt",
  ".find + $gte",
  ".find + $ne",
  ".find + $gt + $lt + $sort",
  ".find + $or nested + $sort",
  ".find + paginate",
  ".find + paginate + $limit + $skip",
  ".find + paginate + $limit 0",
  ".find + paginate + params",
  "params.adapter + paginate",
  "params.adapter + multi",
]);

describe("Feathers Memory Service", () => {
  type Person = {
    id: number;
    name: string;
    age?: number;
  };

  type Animal = {
    type: string;
    age: number;
  };

  const events = ["testing"];
  const app = feathers<{
    people: MemoryService<Person>;
    "people-customid": MemoryService<Person>;
    animals: MemoryService<Animal>;
    matcher: MemoryService;
  }>();

  app.use("people", new MemoryService<Person>({ events }));
  app.use(
    "people-customid",
    new MemoryService<Person>({
      id: "customid",
      events,
    }),
  );

  it("update with string id works", async () => {
    const people = app.service("people");
    const person = await people.create({
      name: "Tester",
      age: 33,
    });

    const updatedPerson: any = await people.update(
      person.id.toString(),
      person,
    );

    assertStrictEquals(typeof updatedPerson.id, "number");

    await people.remove(person.id.toString());
  });

  it("patch record with prop also in query", async () => {
    app.use("animals", new MemoryService<Animal>({ multi: true }));
    const animals = app.service("animals");
    await animals.create([
      {
        type: "cat",
        age: 30,
      },
      {
        type: "dog",
        age: 10,
      },
    ]);

    const [updated] = await animals.patch(null, { age: 40 }, {
      query: { age: 30 },
    });

    assertStrictEquals(updated.age, 40);

    await animals.remove(null, {});
  });

  it("allows to pass custom find and sort matcher", async () => {
    let sorterCalled = false;
    let matcherCalled = false;

    app.use(
      "matcher",
      new MemoryService({
        matcher() {
          matcherCalled = true;
          return function () {
            return true;
          };
        },

        sorter() {
          sorterCalled = true;
          return function () {
            return 0;
          };
        },
      }),
    );

    await app.service("matcher").find({
      query: { $sort: { something: 1 } },
    });

    assert(sorterCalled, "sorter called");
    assert(matcherCalled, "matcher called");
  });

  it("does not modify the original data", async () => {
    const people = app.service("people");

    const person = await people.create({
      name: "Delete tester",
      age: 33,
    });

    delete person.age;

    const otherPerson = await people.get(person.id);

    assertStrictEquals(otherPerson.age, 33);

    await people.remove(person.id);
  });

  it("does not $select the id", async () => {
    const people = app.service("people");
    const person = await people.create({
      name: "Tester",
    });
    const results = await people.find({
      paginate: false,
      query: {
        name: "Tester",
        $select: ["name"],
      },
    });

    assertEquals(
      results[0],
      // @ts-ignore
      { name: "Tester" },
      "deepEquals the same",
    );

    await people.remove(person.id);
  });

  it("update with null throws error", async () => {
    try {
      // @ts-ignore
      await app.service("people").update(null, {});
      throw new Error("Should never get here");
    } catch (error: any) {
      assertStrictEquals(
        error.message,
        "You can not replace multiple instances. Did you mean 'patch'?",
      );
    }
  });

  testSuite(app, errors, "people");
  testSuite(app, errors, "people-customid", "customid");
});
