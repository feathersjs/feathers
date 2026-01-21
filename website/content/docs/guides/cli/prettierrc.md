# Prettier

The Feathers CLI uses [Prettier](https://prettier.io/) for code formatting and generates a configuration for it in a new application. To change the options, like the use of semicolons, quotes etc, edit the `.prettierrc` file with the [options available](https://prettier.io/docs/en/options.html). To update all existing source files with the new code style run

```
npm run prettier
```

When new files are generated, they will use the current Prettier configuration. See the [Prettier Integration with Linters](https://prettier.io/docs/en/integrating-with-linters.html) documentation for how to integrate with tools like ESLint.
