# Security

We take security very seriously at Feathers. We welcome any peer review of our 100% open source code to ensure nobody's Feathers app is ever compromised or hacked. However, as a web application developer, you are responsible for the security of your application. We do our very best to make sure Feathers is as secure as possible.

## Reporting security issues

In order to give the community time to respond and upgrade, we strongly urge you report all security issues to us. Send us a PM on [Discord](https://discord.gg/qa8kez8QBx) or email us at [hello@feathersjs.com](mailto:hello@feathersjs.com) with details, and we will respond ASAP. Security issues always take precedence over bug fixes and feature work; so, we'll work with you to come up with a resolution and plan and document the issue on Github in the appropriate repo.

Issuing releases is typically very quick. Once an issue is resolved it is usually released immediately with the appropriate semantic version.

## Security considerations

Here are some things that you should be aware of when writing your app to make sure it is secure.

- Make sure to set up proper [event channels](../api/channels) so that only clients that are allowed to see them can see real-time updates
- Use hooks to check security roles to make sure users can only access data they should be permitted to. You can find useful hook utilities in [feathers-hooks-common](https://hooks-common.feathersjs.com/) and [feathers-authentication-hooks](https://github.com/feathersjs-ecosystem/feathers-authentication-hooks/).
- Restrict the [allowed database queries](../api/databases/querying) to only the use cases your application requires by sanitizing `params.query` in a hook.
- When you explicitly allow multiple element changes, make sure queries are secured properly to limit the items that can be changed.

- Escape any HTML and JavaScript to avoid XSS attacks.
- Escape any SQL (typically done by the SQL library) to avoid SQL injection.
- JSON Web Tokens (JWT's) are only signed. They are **not** encrypted. Therefore, the payload can be examined on the client. This is by design. **DO NOT** put anything that should be private in the JWT `payload` unless you encrypt it first.
- Don't use a weak `secret` for your token service. The generator creates a strong one for you automatically. No need to change it.

## Technologies used

- Password storage inside `@feathers/authentication-local` uses [bcrypt](https://github.com/dcodeIO/bcrypt.js). We don't store the salts separately since they are included in the bcrypt hashes.
- By default, [JWT](https://jwt.io/)'s are stored in Local Storage (instead of cookies) to avoid CSRF attacks. For JWT, we use the `HS256` algorithm by default (HMAC using SHA-256 hash algorithm). If you choose to store JWT's in cookies, your app may have CSRF vulnerabilities.

## XSS attacks

As with any web application **you** need to guard against XSS attacks. Since Feathers persists the JWT in localstorage in the browser, if your app falls victim to a XSS attack your JWT could be used by an attacker to make malicious requests on your behalf. This is far from ideal. Therefore you need to take extra care in preventing XSS attacks. Our stance on this particular attack vector is that if you are susceptible to XSS attacks, then a compromised JWT is the least of your worries because keystrokes could be logged and attackers can just steal passwords, credit card numbers, or anything else your users type directly.

For more information see [this issue](https://github.com/feathersjs/authentication/issues/132)
