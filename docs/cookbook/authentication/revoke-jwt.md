---
outline: deep
---

# Revoking JWTs

By default a valid JWT can be used for as long as it is valid. To do a normal logout the client just "forgets" their JWT (usually by removing it from localStorage).

To add the ability to revoke an access token so that it can be no longer used even if it is still valid [the authentication service](../../api/authentication/service.md) can be customized as follows.

## Basic example

The following example shows the basic flow of how a JWT can be revoked by storing it in a plain object. In a normal application you would use something like the [Redis storage shown below](#using-redis).

```js
const { AuthenticationService } = require('@feathersjs/authentication');
const { NotAuthenticated } = require('@feathersjs/errors');

const revokedTokens = {};

class RevokableAuthService extends AuthenticationService {
  async revokeAccessToken (accessToken) {
    // First make sure the access token is valid
    const verified = await this.verifyAccessToken(accessToken);

    revokedTokens[accessToken] = true;

    return verified;
  }

  async verifyAccessToken(accessToken) {
    // First check if the token has been revoked
    if (revokedTokens[accessToken]) {
      throw new NotAuthenticated('Token revoked');
    }

    return super.verifyAccessToken(accessToken);
  }

  async remove (id, params) {
    const authResult = await super.remove(id, params);
    const { accessToken } = authResult;

    if (accessToken) {
      // If there is an access token, revoke it
      await this.revokeAccessToken(accessToken);
    }

    return authResult;
  }
}

app.use('/authentication', new RevokableAuthService(app));
```

## Using Redis

[Redis](https://redis.io/) is a great storage mechanism for revoked JWTs because it allows to remove keys after a certain time. A revoked JWT does not have to be stored forever and can be removed from storage after it has expired since it will no longer be valid anyway. The flow is the same as shown above but using the NodeJS Redis adapter instead:

```
npm install redis
```

```js
const redis = require('redis');

const { AuthenticationService } = require('@feathersjs/authentication');
const { NotAuthenticated } = require('@feathersjs/errors');

class RedisAuthService extends AuthenticationService {
  constructor (app, configKey) {
    super(app, configKey);

    const client = redis.createClient();

    this.redis = {
      client,
      get: client.get.bind(client),
      set: client.set.bind(client),
      exists: client.exists.bind(client),
      expireat: client.exists.bind(client)
    }

    (async () => {
      await this.redis.client.connect();
    })()
  }

  async revokeAccessToken (accessToken) {
    // First make sure the access token is valid
    const verified = await this.verifyAccessToken(accessToken);
    // Calculate the remaining valid time for the token (in seconds)
    const expiry = verified.exp - Math.floor(Date.now() / 1000);

    // Add the revoked token to Redis and set expiration
    await this.redis.set(accessToken, 1, { EX: expiry });

    return verified;
  }

  async verifyAccessToken(accessToken) {
    if (await this.redis.exists(accessToken)) {
      throw new NotAuthenticated('Token revoked');
    }

    return super.verifyAccessToken(accessToken);
  }

  async remove (id, params) {
    const authResult = await super.remove(id, params);
    const { accessToken } = authResult;

    if (accessToken) {
      // If there is an access token, revoke it
      await this.revokeAccessToken(accessToken);
    }

    return authResult;
  }
}

app.use('/authentication', new RedisAuthService(app));
```
