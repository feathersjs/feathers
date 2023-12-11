---
outline: deep
---

# Discord

Discord login can be initialized like any other [OAuth provider](../../api/authentication/oauth.md) by adding the app id and secret to `config/default.json`:

```js
{
  "authentication": {
    "oauth": {
      "discord": {
        "key": "<App ID>",
        "secret": "<App Secret>",
        "scope": ["identify email"]
      }
    }
  }
}
```

> __Protip:__ A list of all available Discord scopes can be found [here](https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes)

## Application client and secret

The client id (App ID) and secret can be found [here](https://discord.com/developers/applications/):
![Discord App](https://cdn.discordapp.com/attachments/468897350807453706/722369856317423656/unknown.png)

Now add this to your src/authentication.ts:

```ts
import {OAuthProfile, OAuthStrategy} from "@feathersjs/authentication-oauth";
import {AuthenticationRequest} from "@feathersjs/authentication";
import axios, {AxiosRequestConfig} from 'axios'
import {ServiceAddons} from '@feathersjs/feathers';
import {AuthenticationService, JWTStrategy} from '@feathersjs/authentication';
import {LocalStrategy} from '@feathersjs/authentication-local';
import {oauth} from '@feathersjs/authentication-oauth';
import {Application} from './declarations';


export default function (app: Application) {
  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());
  authentication.register('discord', new DiscordStrategy());

  app.use('/authentication', authentication);
  app.configure(oauth());
}

export class DiscordStrategy extends OAuthStrategy {
  async getProfile(authResult: AuthenticationRequest) {
    // This is the OAuth access token that can be used
    // for Discord API requests as the Bearer token
    const accessToken = authResult.access_token;
    const userOptions: AxiosRequestConfig = {
      method: 'GET',
      headers: {'Authorization': `Bearer ${accessToken}`},
      url: `https://discord.com/api/users/@me`,
    };
    const {data} = await axios(userOptions);
    return data;
  }

  async getEntityData(profile: OAuthProfile) {
    // `profile` is the data returned by getProfile
    const baseData = await super.getEntityData(profile);

    if (profile.avatar == null) {
      profile.avatar = 'https://cdn.discordapp.com/embed/avatars/0.png'
    } else {
      const isGif = profile.avatar.startsWith('a_');
      profile.avatar = `https://cdn.discordapp.com/avatars/${profile['id']}/${profile['avatar']}.${isGif ? 'gif' : 'png'}`
    }

    return {
      ...baseData,
      username: profile.username,
      email: profile.email,
      avatar: profile.avatar,
    };
  }
}
```

If you don't need the avatar then you can simply remove the lines of code.
If the user doesn't have an avatar then we will set it to Discord's default avatar.


