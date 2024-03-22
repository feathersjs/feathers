---
outline: deep
---

# Anonymous authentication

Anonymous authentication can be allowed by creating a [custom strategy](../../api/authentication/strategy.md) that returns the `params` that you would like to use to identify an authenticated user.



<LanguageBlock global-id="ts">

```ts
import { Params } from '@feathersjs/feathers';
import { AuthenticationBaseStrategy, AuthenticationResult, AuthenticationService } from '@feathersjs/authentication';

class AnonymousStrategy extends AuthenticationBaseStrategy {
  async authenticate(authentication: AuthenticationResult, params: Params) {
    return {
      anonymous: true
    }
  }
}

export default function(app: Application) {
  const authentication = new AuthenticationService(app);
  // ... authentication service setup
  authentication.register('anonymous', new AnonymousStrategy());
}
```

</LanguageBlock>

<LanguageBlock global-id="js">

In `src/authentication.js`:

```js
const { AuthenticationBaseStrategy, AuthenticationService } = require('@feathersjs/authentication');

class AnonymousStrategy extends AuthenticationBaseStrategy {
  async authenticate(authentication, params) {
    return {
      anonymous: true
    }
  }
}

module.exports = app => {
  const authentication = new AuthenticationService(app);
  // ... authentication service setup
  authentication.register('anonymous', new AnonymousStrategy());
}
```

</LanguageBlock>




Next, we create a hook called `allow-anonymous` that sets `params.authentication` if it does not exist and if `params.provider` exists (which means it is an external call) to use that `anonymous` strategy:



<LanguageBlock global-id="ts">

```ts
import { Hook, HookContext } from '@feathersjs/feathers';

export default (): Hook => {
  return async (context: HookContext, next?: NextFunction) => {
    const { params } = context;

    if (params.provider && !params.authentication) {
      context.params = {
        ...params,
        authentication: {
          strategy: 'anonymous'
        }
      }
    }

    if (next) {
      await next();
    }

    return context;
  }
}
```

</LanguageBlock>

<LanguageBlock global-id="js">

```js
/* eslint-disable require-atomic-updates */
module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return async context => {
    const { params } = context;

    if(params.provider && !params.authentication) {
      context.params = {
        ...params,
        authentication: {
          strategy: 'anonymous'
        }
      }
    }

    return context;
  };
};
```

</LanguageBlock>



This hook should be added __before__ the [authenticate hook](../../api/authentication/hook.md) wherever anonymous authentication should be allowed:

```js
all: [ allowAnonymous(), authenticate('jwt', 'anonymous') ],
```

If an anonymous user now accesses the service externally, the service call will succeed and have `params.anonymous` set to `true`.
