---
outline: deep
---

# Overview

Feathers database adapters are modules that provide [services](../services.md) that implement standard [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) functionality for a specific database. They use a [common API](./common.md) for initialization and settings, and they provide a [common query syntax](./querying.md).

<BlockQuote>

[Services](../services.md) allow to implement access to _any_ database or API. The database adapters listed here are just convenience wrappers with a common API. See the community adapters section for support for other datastores.

</BlockQuote>

## Core Adapters

The following data storage adapters are available in Feathers core

| Core Package         | Supported Data Stores                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| [Memory](./memory)   | Memory                                                                                                         |
| [MongoDB](./mongodb) | MongoDB                                                                                                        |
| [SQL (Knex)](./knex) | MySQL<br/> MariaDB <br/> PostgreSQL<br/> CockroachDB<br/> SQLite<br/> Amazon Redshift<br/> OracleDB<br/> MSSQL |

## Community Adapters

There are also many community maintained adapters for other databases and ORMs which can be found on the [Ecosystem page](/ecosystem/?cat=Database&sort=lastPublish).
