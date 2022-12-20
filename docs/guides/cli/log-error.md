# Error logging hook

The `src/hooks/log-error.ts` file exports a `logError` hook that uses the [logger](./logger.md) to log any error for a service method, including validation error details (when they are available). It is registered as an [application hook](./app.md#application-hooks) `all` hook, meaning it will log errors for any service method.
