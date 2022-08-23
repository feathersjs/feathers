---
outline: deep
---

# Populating Data

<BlockQuote type="danger" label="Unpublished">

This package referenced on this page is not yet available on npm. A pre-release will be available, soon.

</BlockQuote>

<BlockQuote label="Work in Progress">

These docs are incomplete. Feel free to review with the understanding that they will continue to evolve.

</BlockQuote>

For the first time, FeathersJS has an official solution for populating data. While plenty of solutions have been created by the community, the new solution is a very nice fit for Feathers. By combining the conciseness of resolvers with the smarts of data loaders, we've arrived at the cleanest way to populate data between services.

## Why Not Use Joins?

It has long been the belief that a database-level JOIN will always be faster than making two requests and manually combining the results. And why wouldn't it be? You don't have to wait for two round trips to the database. SQL Databases are extremely efficient at performing relational algebra to combine results.
