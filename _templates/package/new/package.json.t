---
to: packages/<%= name %>/package.json
---

{
  "name": "@feathersjs/<%= name %>",
  "description": "<%= description %>",
  "version": "0.0.0",
  "homepage": "https://feathersjs.com",
  "main": "lib/",
  "keywords": [
    "feathers",
    "feathers-plugin"
  ],
  "license": "MIT",
  "funding": {
    "type": "github",
    "url": "https://github.com/sponsors/daffl"
  },
  "repository": {
    "type": "git",
    "url": "git://github.com/feathersjs/feathers.git"
  },
  "author": {
    "name": "Feathers contributors",
    "email": "hello@feathersjs.com",
    "url": "https://feathersjs.com"
  },
  "contributors": [],
  "bugs": {
    "url": "https://github.com/feathersjs/feathers/issues"
  },
  "engines": {
    "node": ">= 12"
  },
  "files": [
    "CHANGELOG.md",
    "LICENSE",
    "README.md",
    "src/**",
    "lib/**",
    "*.d.ts",
    "*.js"
  ],
  "scripts": {
    "prepublish": "npm run compile",
    "compile": "shx rm -rf lib/ && tsc",
    "test": "mocha --config ../../.mocharc.json --recursive test/**.test.ts test/**/*.test.ts"
  },
  "directories": {
    "lib": "lib"
  },
  "publishConfig": {
    "access": "public"
  },
  "dependencies": {
  },
  "devDependencies": {
    "@types/mocha": "^8.2.2",
    "@types/node": "^14.14.37",
    "mocha": "^8.3.2",
    "shx": "^0.3.3",
    "typescript": "^4.2.3"
  }
}
