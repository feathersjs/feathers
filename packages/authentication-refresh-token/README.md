# @feathersjs/authentication-refresh-token

[![CI](https://github.com/feathersjs/feathers/workflows/Node.js%20CI/badge.svg)](https://github.com/feathersjs/feathers/actions?query=workflow%3A%22Node.js+CI%22)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers.svg?style=flat-square&path=packages/authentication)](https://david-dm.org/feathersjs/feathers?path=packages/authentication)
[![Download Status](https://img.shields.io/npm/dm/@feathersjs/authentication.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication)

> Add Authentication Refresh-Token support to your FeathersJS app.

## Installation

```
npm install @feathersjs/authentication-refresh-token --save
```

## Usage

Refresh access-token

```http
PATCH http://localhost:3030/authentication
Content-Type: application/json

{
  "_id": "fbOVXFZ0m1Z9XH90",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6InJlZnJlc2gifQ.eyJzdWIiOiJmYk9WWEZaMG0xWjlYSDkwIiwiaWF0IjoxNTk1NTYxNDg1LCJleHAiOjE2MjY2NjU0ODUsImF1ZCI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJpc3MiOiJleGFtcGxlIiwianRpIjoiOTYxZDJiNTctNzNhOS00YWJmLTgyNmUtMDAxMjU1ZmUxNDg3In0.IEw7gU0GBR2GucmI3z3oRNRozb_h1VPoYLuLqb73rFs"
}
```

Logout user

```http
DELETE http://localhost:3030/authentication?refreshToken=<refresh-token>
Authorization: <access-token>
```

## Documentation

Refer to the [Feathers authentication API documentation](https://docs.feathersjs.com/api/authentication/) for more details.

## License

Copyright (c) 2019

Licensed under the [MIT license](LICENSE).
