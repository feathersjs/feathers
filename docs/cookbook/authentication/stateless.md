---
outline: deep
---

# Stateless JWT

By default, an authentication token is associated to an entity (usually a user). It is also possible to issue tokens that are stateless and not tied to an entity lookup. This can be useful when all the information necessary can be contained in the token payload. The drawback is that the token information can not be changed and will always be valid until the token expires so it is e.g. not possible to disable a user or change their permissions before the token expires.

## Configuration

Stateless tokens can be issued by setting the `entity` option in the [JWT strategy authentication configuration](../../api/authentication/jwt.md#configuration) to `null` (in which case `service` option also won't be used):

```json
{
  "authentication": {
    "secret": "CHANGE_ME",
    "entity": null,
    "authStrategies": [ "jwt", "local" ],
    "jwtOptions": {
      "header": { "typ": "access" },
      "audience": "https://yourdomain.com",
      "issuer": "feathers",
      "algorithm": "HS256",
      "expiresIn": "1d"
    }
  }
}
```

> __Note:__ When still using other built-in strategies (like the [local strategy](../../api/authentication/local.md)) with an entity, the option can be set for each strategy (e.g. `{ "authentication": { "local": { "entity": "user" } } }`).

## Customizing the payload

In order for the token to contain information, the `getPayload` method needs to be customize by [extending the authentication service](../../api/authentication/service.md#customization):

```js
const { AuthenticationService } = require('@feathersjs/authentication');

class MyAuthService extends AuthenticationService {
  async getPayload(authResult, params) {
    // Call original `getPayload` first
    const payload = await super.getPayload(authResult, params);
    const { user } = authResult;

    if (user && user.permissions) {
      payload.permissions = user.permissions;
    }

    return payload;
  }
}

app.use('/authentication', new MyAuthService(app));
```
