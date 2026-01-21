# package.json

## Folders

The source and test folders to which files are generated is set in the `package.json`. To change them, rename the `src/` or `test/` folder to what you want it to and then update `package.json` `directories` section accordingly:

```json
{
  "directories": {
    "lib": "api/src",
    "test": "api/test"
  }
}
```
