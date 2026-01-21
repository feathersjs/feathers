

# Schema Overview

<Badges>

[![npm version](https://img.shields.io/npm/v/@feathersjs/schema.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/schema)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/dove/packages/schema/CHANGELOG)

</Badges>

`@feathersjs/schema` provides a way to define data models and to dynamically resolve them. It comes in in the following main parts:

- [JSON schema](https://json-schema.org/) using [TypeBox](./typebox) or [plain JSON schema](./schema) to define a data model with TypeScript types and validations. This allows us to:
  - Automatically get TypeScript types from schema definitions
  - Automatically generate API documentation
  - Create [database adapter](../databases/common) models without duplicating the data format
- [Validators](./validators) take a [TypeBox](./typebox) or [JSON](./schema) schema to validate data to
  - Ensure data is valid and always in the right format
  - Validate query string queries and convert them to the right type
- [Resolvers](./resolvers) - Resolve properties based on a context (usually the [hook context](../hooks)). This can be used for many different things like:
  - Adding default and computed values
  - Populating associations
  - Securing queries and e.g. limiting requests to a user
  - Removing protected properties for external requests
  - Ability to add read- and write permissions on the property level
  - Hashing passwords and validating dynamic password policies
