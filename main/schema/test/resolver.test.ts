// deno-lint-ignore-file require-await
import {
  describe,
  it,
  assertStrictEquals,
  assertRejects,
  assertEquals
} from "../../commons/mod.ts";
import { BadRequest } from "../../errors/mod.ts";

import { Infer, resolve, schema } from "../mod.ts";

describe("@feathersjs/schema/resolver", () => {
  const userSchema = schema(
    {
      $id: "simple-user",
      type: "object",
      required: ["firstName", "lastName"],
      additionalProperties: false,
      properties: {
        firstName: { type: "string" },
        lastName: { type: "string" },
        password: { type: "string" },
      },
    } as const,
  );
  const context = {
    isContext: true,
  };

  type User = Infer<typeof userSchema> & {
    name: string;
  };

  it("simple resolver", async () => {
    const userResolver = resolve<User, typeof context>({
      properties: {
        password: async (): Promise<string | undefined> => {
          return undefined;
        },

        name: async (_name, user, ctx, status) => {
          assertEquals(ctx, context);
          assertEquals(status.path, ["name"]);
          assertStrictEquals(typeof status.stack[0], "function");

          return `${user.firstName} ${user.lastName}`;
        },
      },
    });

    const u = await userResolver.resolve(
      {
        firstName: "Dave",
        lastName: "L.",
      },
      context,
    );

    assertEquals(u, {
      firstName: "Dave",
      lastName: "L.",
      name: "Dave L.",
    });

    const withProps: any = await userResolver.resolve(
      {
        firstName: "David",
        lastName: "L",
      },
      context,
      {
        properties: ["name", "lastName"],
      },
    );

    assertEquals(withProps, {
      name: "David L",
      lastName: "L",
    });
  });

  it("simple resolver with schema and validation", async () => {
    const userBeforeResolver = resolve<User, typeof context>({
      schema: userSchema,
      validate: "before",
      properties: {
        name: async (_name, user) => `${user.firstName} ${user.lastName}`,
      },
    });
    const userAfterResolver = resolve<User, typeof context>({
      schema: userSchema,
      validate: "after",
      properties: {
        firstName: async () => undefined,
      },
    });

    await assertRejects(() => userBeforeResolver.resolve({}, context),"validation failed");
    await assertRejects(
      () =>
        userAfterResolver.resolve(
          {
            firstName: "Test",
            lastName: "Me",
          },
          context,
        ),
      "validation failed",
    );
  });

  it("simple resolver with converter", async () => {
    const userConverterResolver = resolve<User, typeof context>({
      schema: userSchema,
      validate: "before",
      converter: async (data) => ({
        firstName: "Default",
        lastName: "Name",
        ...data,
      }),
      properties: {
        name: async (_name, user) => `${user.firstName} ${user.lastName}`,
      },
    });

    const u = await userConverterResolver.resolve({}, context);

    assertEquals(u, {
      firstName: "Default",
      lastName: "Name",
      name: "Default Name",
    });
  });

  it("resolving with errors", async () => {
    const dummyResolver = resolve<{
      name: string; age: number
    }, unknown>({
      properties: {
        name: async (value?: string) => {
          if (value === "Dave") {
            throw new Error(`No ${value}s allowed`);
          }

          return value;
        },
        age: async (value) => {
          if (value && value < 18) {
            throw new BadRequest("Invalid age");
          }

          return value;
        },
      },
    });

    const error = await assertRejects(
      () =>
        dummyResolver.resolve(
          {
            name: "Dave",
            age: 16,
          },
          {},
        ),
    );

    assertEquals(error, {
      name: "BadRequest",
      message: "Error resolving data",
      code: 400,
      className: "bad-request",
      data: {
        name: { message: "No Daves allowed" },
        age: {
          name: "BadRequest",
          message: "Invalid age",
          code: 400,
          className: "bad-request",
        },
      },
    },)
  });
});
