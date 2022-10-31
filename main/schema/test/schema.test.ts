import {
  describe,
  it,
  assertStrictEquals,
  assertRejects,
  assertEquals,
assert,
assertInstanceOf
} from "../../commons/mod.ts";

import { Infer, queryProperty, schema } from "../mod.ts";
import Ajv, { AnySchemaObject } from "https://esm.sh/ajv@8.11.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";

const customAjv = new Ajv({
  coerceTypes: true,
});
addFormats(customAjv);

// Utility for converting "date" and "date-time" string formats into Dates.
customAjv.addKeyword({
  keyword: "convert",
  type: "string",
  compile(schemaVal: boolean, parentSchema: AnySchemaObject) {
    return ["date-time", "date"].includes(parentSchema.format) && schemaVal
      ? function (value: string, obj: any) {
        const { parentData, parentDataProperty } = obj;
        // Update date-time string to Date object
        parentData[parentDataProperty] = new Date(value);
        return true;
      }
      : () => true;
  },
});

describe("@feathersjs/schema/schema", () => {
  it("type inference and validation", async () => {
    const messageSchema = schema(
      {
        $id: "message-test",
        type: "object",
        required: ["text", "read"],
        additionalProperties: false,
        properties: {
          text: {
            type: "string",
          },
          read: {
            type: "boolean",
          },
          upvotes: {
            type: "number",
          },
        },
      } as const,
    );
    type Message = Infer<typeof messageSchema>;

    const message = await messageSchema.validate<Message>({
      text: "hi",
      read: 0,
      upvotes: "10",
    });

    assertEquals(messageSchema.toJSON(), messageSchema.definition);
    assertEquals(message, {
      text: "hi",
      read: false,
      upvotes: 10,
    });

    const error = await assertRejects(() => messageSchema.validate({ text: "failing" }));

    assertEquals(error, {
      name: "BadRequest",
      data: [
        {
          instancePath: "",
          keyword: "required",
          message: "must have required property 'read'",
          params: {
            missingProperty: "read",
          },
          schemaPath: "#/required",
        },
      ],
    });
  });

  it("uses custom AJV with format validation", async () => {
    const formatsSchema = schema(
      {
        $id: "formats-test",
        type: "object",
        required: [],
        additionalProperties: false,
        properties: {
          dobString: {
            type: "string",
            format: "date",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
        },
      } as const,
      customAjv,
    );

    await formatsSchema.validate({
      createdAt: "2021-12-22T23:59:59.999Z",
    });

    try {
      await formatsSchema.validate({
        createdAt: "2021-12-22T23:59:59.bbb",
      });
    } catch (error: any) {
      assertStrictEquals(error.data[0].message, 'must match format "date-time"');
    }
  });

  it("custom AJV can convert dates", async () => {
    const formatsSchema = schema(
      {
        $id: "converts-formats-test",
        type: "object",
        required: [],
        additionalProperties: false,
        properties: {
          dobString: queryProperty({
            type: "string",
            format: "date",
            convert: true,
          }),
          createdAt: {
            type: "string",
            format: "date-time",
            convert: true,
          },
        },
      } as const,
      customAjv,
    );

    const validated = await formatsSchema.validate({
      dobString: { $gt: "2025-04-25" },
      createdAt: "2021-12-22T23:59:59.999Z",
    });

    assertInstanceOf((validated.dobString as any).$gt, Date);
    assertInstanceOf((validated.createdAt as any), Date);
  });

  it("schema extension and type inference", async () => {
    const messageSchema = schema(
      {
        $id: "message-ext",
        type: "object",
        required: ["text", "read"],
        additionalProperties: false,
        properties: {
          text: {
            type: "string",
          },
          read: {
            type: "boolean",
          },
        },
      } as const,
    );

    const messageResultSchema = schema(
      {
        $id: "message-ext-vote",
        type: "object",
        required: ["upvotes", ...messageSchema.definition.required],
        additionalProperties: false,
        properties: {
          ...messageSchema.definition.properties,
          upvotes: {
            type: "number",
          },
        },
      } as const,
    );

    type MessageResult = Infer<typeof messageResultSchema>;

    const m = await messageResultSchema.validate<MessageResult>({
      text: "Hi",
      read: "false",
      upvotes: "23",
    });

    assertEquals(m, {
      text: "Hi",
      read: false,
      upvotes: 23,
    });
  });

  it("with references", async () => {
    const userSchema = schema(
      {
        $id: "ref-user",
        type: "object",
        required: ["email"],
        additionalProperties: false,
        properties: {
          email: { type: "string" },
          age: { type: "number" },
        },
      } as const,
      customAjv,
    );
    const messageSchema = schema(
      {
        $id: "ref-message",
        type: "object",
        required: ["text", "user"],
        additionalProperties: false,
        properties: {
          text: {
            type: "string",
          },
          user: {
            $ref: "ref-user",
          },
        },
      } as const,
      customAjv,
    );

    type User = Infer<typeof userSchema>;
    type Message = Infer<typeof messageSchema> & {
      user: User;
    };

    const res = await messageSchema.validate<Message>({
      text: "Hello",
      user: {
        email: "hello@feathersjs.com",
        age: "42",
      },
    });

    assert(userSchema);
    assertEquals(res, {
      text: "Hello",
      user: { email: "hello@feathersjs.com", age: 42 },
    });
  });

  it("works with oneOf properties (#2508)", async () => {
    const oneOfSchema = schema(
      {
        $id: "schemaA",
        oneOf: [
          {
            type: "object",
            additionalProperties: false,
            required: ["x"],
            properties: {
              x: { type: "number" },
            },
          },
          {
            type: "object",
            additionalProperties: false,
            required: ["y"],
            properties: {
              y: { type: "number" },
            },
          },
        ],
      } as const,
    );

    const res = await oneOfSchema.validate({
      x: "3",
    });

    assertEquals(res, { x: 3 });
  });

  it("can handle compound queryProperty", async () => {
    const formatsSchema = schema(
      {
        $id: "compoundQueryProperty",
        type: "object",
        required: [],
        additionalProperties: false,
        properties: {
          dobString: queryProperty({
            oneOf: [
              { type: "string", format: "date", convert: true },
              { type: "string", format: "date-time", convert: true },
              { type: "object" },
            ],
          }),
        },
      } as const,
      customAjv,
    );

    const validated = await formatsSchema.validate({
      dobString: { $gt: "2025-04-25", $lte: new Date("2027-04-25") },
    });

    assert(validated);
  });

  it("can still fail queryProperty validation", async () => {
    const formatsSchema = schema(
      {
        $id: "compoundQueryPropertyFail",
        type: "object",
        required: [],
        additionalProperties: false,
        properties: {
          dobString: queryProperty({ type: "string" }),
        },
      } as const,
      customAjv,
    );

    try {
      const validated = await formatsSchema.validate({
        dobString: { $moose: "test" },
      });
      assert(!validated, "should not have gotten here");
    } catch (error: any) {
      assert(error.data?.length > 0);
    }
  });

  it("removes default from queryProperty schemas like $gt", async () => {
    const validator = schema(
      {
        $id: "noDefault$gt",
        type: "object",
        required: [],
        additionalProperties: false,
        properties: {
          someDate: queryProperty({ default: "0000-00-00", type: "string" }),
        },
      } as const,
      customAjv,
    );

    assertStrictEquals(
      validator.definition.properties.someDate.anyOf[1].properties.$gt.type,
      "string",
      "type is found under $gt",
    );
    assert(
      !validator.definition.properties.someDate.anyOf[1].properties.$gt.default,
      "no default under $gt",
    );
  });
});
