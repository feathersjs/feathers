# feathers-authentication-local Example

This provides a complete working example on how to use `feathers-authentication-local` to provide local authentication and get a JWT access token in return.

1. Start the app by running `npm start`
2. Make a request using the authenticated user.

```bash
curl -H "Content-Type: application/json" -X POST -d '{"email":"admin@feathersjs.com","password":"admin"}' http://localhost:3030/authentication
```
