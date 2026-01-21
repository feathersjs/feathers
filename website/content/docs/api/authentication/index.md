

# Authentication Overview

The `@feathersjs/authentication` plugins provide a collection of tools for username/password, JWT and OAuth (GitHub, Facebook etc.) authentication as well as custom authentication mechanisms.

It consists of the following core modules:

- `@feathersjs/authentication` which includes
  - The [AuthenticationService](./service) that allows to register [authentication strategies](./strategy) and create and manage access tokens
  - The [JWTStrategy](./jwt) to use JWTs to make authenticated requests
  - The [authenticate hook](./hook) to limit service calls to an authentication strategy.
- [Local authentication](./local) for local username/password authentication
- [OAuth authentication](./oauth) for Google, GitHub, Facebook etc. authentication
- [The authentication client](./client) to use Feathers authentication on the client.

::warning
`@feathersjs/authentication` is an abstraction for different authentication mechanisms. It does not handle things like user verification or password reset functionality etc. This can be implemented manually, with the help of libraries like [feathers-authentication-management](https://github.com/feathers-plus/feathers-authentication-management) or a platform like [Auth0](https://auth0.com/).
::
