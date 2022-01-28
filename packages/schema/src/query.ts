import { JSONSchema } from 'json-schema-to-ts';

export const queryProperty = <T extends JSONSchema> (definition: T) => ({
  anyOf: [
    definition,
    {
      type: 'object',
      additionalProperties: false,
      properties: {
        $gt: definition,
        $gte: definition,
        $lt: definition,
        $lte: definition,
        $ne: definition,
        $in: {
          type: 'array',
          items: definition
        },
        $nin: {
          type: 'array',
          items: definition
        }
      }
    }
  ]
} as const);
