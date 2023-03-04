---
outline: deep
---

### Configuration Schemas

A generated application comes with a schema that validates the initial configuration when the application is started. This makes it much easier to catch configuration errors early which can otherwise be especially difficult to debug in remote environments.

The configuration [schema definition](../../api/schema/index.md) can be found in `configuration.ts`. It is used as a [configuration schema](../../api/configuration.md#configuration-validation) and loads some default schemas for authentication and database connection configuration and adds values for `host`, `port` and the `public` hosted file folder. The types of this schema are also used for `app.get()` and `app.set()` [typings](./declarations.md). The initial configuration schema will be validated on application startup when calling [`app.listen()`](../../api/application.md#listenport) or [`app.setup()`](../../api/application.md#setupserver).
