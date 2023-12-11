---
outline: deep
---

# Authentication

The file in `src/authentication.ts` sets up an [authentication service](../../api/authentication/service.md) and registers [authentication strategies](../../api/authentication/strategy.md). Depending on the strategies you selected it looks similar to this:

```ts
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'

import type { Application } from './declarations'

declare module './declarations' {
  interface ServiceTypes {
    authentication: AuthenticationService
  }
}

export const authentication = (app: Application) => {
  const authentication = new AuthenticationService(app)

  authentication.register('jwt', new JWTStrategy())
  authentication.register('local', new LocalStrategy())

  app.use('authentication', authentication)
}
```

## oAuth

Note that when selecting oAuth logins (Google, Facebook, GitHub etc.), the standard registered oAuth strategy only uses the `<name>Id` property to create a new user. This will fail validation against the default user [schema](./service.schemas.md) which requires an `email` property to exist. If the provider (and user) allows fetching the email, you can customize the oAuth strategy like shown for GitHub in the [oAuth authentication guide](../basics/authentication.md#login-with-github). You can also make the email in the schema optional with `email: Type.Optional(Type.String())`.
