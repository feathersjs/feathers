---
outline: deep
---

# Generate an App

You can generate a new app with `feathers generate app`. Before running the generator, create a directory for your project. Then open that project in a terminal and run the command:

```bash
npm create feathers@pre myapp
```

It will create a `myapp` folder and then ask the following questions.

## Generator Questions

The app generator will ask you a series of questions. The following sections provide an overview of those questions.

### TypeScript or JavaScript

```bash
? Do you want to use JavaScript or TypeScript? (Use arrow keys)
❯ TypeScript
  JavaScript
```

You can select a TypeScript project or a JavaScript project. The apps produced by each option are exactly equivalent in functionality. When you select "JavaScript" we generate a TypeScript app, compile it to JavaScript, then write the `.js` files to disk. The benefits of this approach are that you

### App Name

```bash
? What is the name of your application? (my-app)
```

The default name (in parentheses) will be the name of the folder that you created. Pay attention that it's the correct folder and that you don't accidentally generate in the parent folder. The name you select will become the `name` property in the `package.json`.

### App Description

```bash
? Write a short description
```

The text you specify here will become the `description` in the `package.json`.

### HTTP Framework

```bash
? Which HTTP framework do you want to use? (Use arrow keys)
❯ KoaJS (recommended)
  Express
```

The generator allows you to build on top of either of the big names in Node HTTP Frameworks: KoaJS or Express. For most Feathers applications, you only ever lightly touch the underlying framework for tasks like setting up CORS.

If you don't absolutely need some Express API or middleware package, we recommend using the more-modern KoaJS framework. We've selected it as the new default in Feathers v5.

### Transport Layer APIs

```bash
? What APIs do you want to offer? (Press <space> to select, <a> to toggle all, <i> to invert selection, and <enter> to proceed)
❯◉ HTTP (REST)
 ◉ Real-time
```

Feathers is unique in that it can use the same API for either HTTP or Real-time requests. You can even use both at the same time. When you use Feathers Hooks for authorization and access control, you secure requests on both transports at the same time!

If you select `HTTP (REST)`, then the REST adapter for your chosen HTTP framework will be installed.

If you select `Real-time`, the `@feathersjs/socketio` adapter will be installed.

### Package Manager

```bash
? Which package manager are you using? (Use arrow keys)
❯ npm
  Yarn
  pnpm
```

You answer here will determine which package manager is used to install modules. If you haven't installed Yarn or pnpm, select `npm`.

### Schema Format

```bash
? What is your preferred schema (model) definition format? (Use arrow keys)
❯ TypeBox (recommended)
  JSON schema
```

The new Feathers v5 Dove has built-in support for TypeBox and JSON Schema schema definition formats. Both options are type friendly. Just define your schema and your get automatic TypeScript types for free. TypeBox is fully JSON schema compatible but in a format that is more concise and easier to read.

### Database

```bash
? Which database are you connecting to? Other databases can be added at any time (Use arrow keys)
❯ SQLite
  MongoDB
  PostgreSQL
  MySQL/MariaDB
  Microsoft SQL
```

Feathers will setup a database connection to whichever database you select in this step. The Feathers v5 Dove generator supports the most popular databases using two database adapter that have been brought into core:

- If you select `MongoDB`, the `@feathersjs/mongodb` package will be installed and configured.
- If you select `SQLite`, `PostgreSQL`, `MySQL/MariaDB`, or `Microsoft SQL` the `@feathersjs/knex` adapter will be installed.

#### Why are there fewer options?

Feathers v5 Dove is still 100% compatible with database adapters for previous versions, so even though the generator doesn't directly set them up for you, you can manually add them using the instructions in each project. You can find additional Feathers-supported databases and other plugins by searching the [feathers-plugin tag on npm](https://www.npmjs.com/search?q=keywords:feathers-plugin).

If Feathers still supports the other database adapters, why are they not listed? Since we now have built-in support for Feathers Schemas, we chose to support the most popular databases by bringing low-level adapters into Feathers core. By "low-level" adapters, we mean the ones that run closest to the database, itself, without their own ORM or schema layer. For example, since KnexJS is a query builder for the popular SQL databases, we chose to bring it into core. ObjectionJS and Sequelize adapters can still be setup manually. Similarly, we brought the MongoDB adapter into core and no longer generate feathers-mongoose services, automatically.

Our ultimate plan is to use the new generator (which we built from the ground up, ourselves) to bring back pluggable support for custom generators. In the future, each database adapter's repo will also host its generator code, along with custom generators for your own projects.

One more thing worth noting: we have also brought `feathers-memory` into the core and renamed it to `@feathersjs/memory`. It's not currently available in the generator.

Now, back to the generator. Once you've selected a database adapter you can move on to the next step.

### Connection String

```bash
? Enter your database connection string (mongodb://localhost:27017/my-app)
```

Generally, you'll want to enter the connection string for the development database and not the production database. Production database connection strings most likely are safest in an environment variable. A development database usually doesn't require the same level of security. Depending on which database you selected, a default connection string will be presented. Press `enter` to accept it, or enter your own connection string.

### Authentication Method

```bash
? Which authentication methods do you want to use? Other methods and providers can be added at any time. (Press <space> to select, <a> to toggle all, <i>
to invert selection, and <enter> to proceed)
❯◉ Email + Password
 ◯ Google
 ◯ Facebook
 ◯ Twitter
 ◯ GitHub
 ◯ Auth0
```

Depending on which option you choose, Feathers will install it alongside the JWT authentication strategy package. After authentication with the chosen method, Feathers gives you a JWT which can be used to authenticate with the API.

Choosing `Email + Password` will install the "@feathersjs/authentication-local" package to handle password auth.

Choosing any of the other options will install the `@feathersjs/authentication-oauth` package to handle logging in with the selected login provider.

### Install dependencies

Once you've selected the final question, the generator will create the necessary files and then install packages. The output will look something like the below, but will vary a bit if you selected a package manager other than `npm`.

```bash
    Wrote file test/app.test.ts
    Wrote file src/app.ts
    Wrote file src/channels.ts
    Wrote file src/client.ts
    Wrote file config/default.json
    Wrote file config/test.json
    Wrote file config/custom-environment-variables.json
    Wrote file src/declarations.ts
    Wrote file public/index.html
    Wrote file src/index.ts
    Wrote file src/logger.ts
    Wrote file package.json
    # Other files may show up here depending on your selections
    Running npm install --save

# ...

found 0 vulnerabilities
```
