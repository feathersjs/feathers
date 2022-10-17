# Overview

Feathers database adapters are modules that provide [services](../services.md) that implement standard [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) functionality for a specific database using a [common API](./common.md) for initialization and settings and providing a [common query syntax](./querying.md).

> __Important:__ [Services](../services.md) allow to implement access to _any_ database, the database adapters listed here are just convenience wrappers with a common API. You can still get Feathers functionality for databases that are not listed here. Also have a look at the list of [community database adapters](https://github.com/feathersjs/awesome-feathersjs#database)

The following databases are supported:

| Database | Adapter |
|---|---|
| In memory | [feathers-memory](https://github.com/feathersjs-ecosystem/feathers-memory), [feathers-nedb](https://github.com/feathersjs-ecosystem/feathers-nedb) |
| Localstorage, AsyncStorage | [feathers-localstorage](https://github.com/feathersjs-ecosystem/feathers-localstorage) |
| Filesystem | [feathers-nedb](https://github.com/feathersjs-ecosystem/feathers-nedb) |
| MongoDB | [feathers-mongodb](https://github.com/feathersjs-ecosystem/feathers-mongodb), [feathers-mongoose](https://github.com/feathersjs-ecosystem/feathers-mongoose) |
| MySQL, PostgreSQL, MariaDB, SQLite, MSSQL | [feathers-knex](https://github.com/feathersjs-ecosystem/feathers-knex), [feathers-sequelize](https://github.com/feathersjs-ecosystem/feathers-sequelize) |
| Elasticsearch | [feathers-elasticsearch](https://github.com/feathersjs-ecosystem/feathers-elasticsearch) |
| Objection | [feathers-objection](https://github.com/feathersjs-ecosystem/feathers-objection) |
| Cassandra | [feathers-cassandra](https://github.com/feathersjs-ecosystem/feathers-cassandra) |

## Memory/Filesystem

- [feathers-memory](https://github.com/feathersjs-ecosystem/feathers-memory) - An in-memory database adapter
- [feathers-localstorage](https://github.com/feathersjs-ecosystem/feathers-localstorage) - An adapter for [Client side Feathers](../client.md) that can use the browsers [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) or ReactNative's [AsyncStorage](https://facebook.github.io/react-native/docs/asyncstorage.html).
- [feathers-nedb](https://github.com/feathersjs-ecosystem/feathers-nedb) - A database adapter for [NeDB](https://github.com/louischatriot/nedb) an in-memory or file system based standalone database.

## SQL

- [feathers-knex](https://github.com/feathersjs-ecosystem/feathers-knex) - An adapter for [KnexJS](http://knexjs.org/), an SQL query builder for NodeJS supporting PostgreSQL, MySQL, SQLite and MSSQL
- [feathers-sequelize](https://github.com/feathersjs-ecosystem/feathers-sequelize) - An adapter for [Sequelize](http://docs.sequelizejs.com/) an ORM for NodeJS supporting PostgreSQL, MySQL, SQLite and MSSQL
- [feathers-objection](https://github.com/feathersjs-ecosystem/feathers-objection) - A service adapter for [Objection.js](https://vincit.github.io/objection.js) - A minimal SQL ORM built on top of Knex.

## NoSQL

- [feathers-mongoose](https://github.com/feathersjs-ecosystem/feathers-mongoose) - A database adapter for [Mongoose](http://mongoosejs.com/) an Object Modelling library for NodeJS and MongoDB
- [feathers-mongodb](https://github.com/feathersjs-ecosystem/feathers-mongodb) - A database adapter for [MongoDB](https://www.mongodb.com/) using the official NodeJS database driver
- [feathers-elasticsearch](https://github.com/feathersjs-ecosystem/feathers-elasticsearch) - A database adapter for [Elasticsearch](https://github.com/elastic/elasticsearch)
- [feathers-cassandra](https://github.com/feathersjs-ecosystem/feathers-cassandra) - A database adapter for [Cassandra](http://cassandra.apache.org)
