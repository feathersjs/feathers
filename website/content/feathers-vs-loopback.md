# Feathers vs LoopBack

Both LoopBack, and Feathers are frameworks primarily meant for building APIs, and mediating between front-end clients, and backend data sources.

LoopBack is maintained by StrongLoop (an IBM company); while Feathers is community maintained. Folks behind StrongLoop are also the current maintainers of the Express framework atop of which both Feathers, and LoopBack are built.

While LoopBack is a MVC framework bringing in its own set of conventions/concepts, with route-based CRUD config for its entities, Feathers propagates a service-oriented thinking model, where in you can build lightweight services to define entities — **"you're no longer thinking CRUD routes for an entity; but a corresponding service, which represents an entity, and the CRUD methods for it"** — and it gets out of your way allowing you to set your own conventions.

Feathers has support for multiple databases and ORMs. LoopBack only supports its inbuilt ORM (based on Juggler). It should be noted, that LoopBack v4, which is under heavy development as of this writing would open support for multiple ORMs.

Feathers core is engine-agnostic; meaning it works on both client, server sides. LoopBack comes with a separate in-built client.

Feathers has official libraries which can be integrated with Feathers to support multiple transport layers apart from rest; like sockets, primus, etc... This can be achieved in LoopBack via various community libraries.

LoopBack comes with in-built support for generating ACLs and an in-built API explorer, which makes it easier to analyse the built APIs, via auto-generated docs. Thanks to a rich ecosystem of libraries around Feathers, this can be achieved in Feathers via third party libraries like [feathers-permissions](https://github.com/feathersjs-ecosystem/feathers-permissions), and [feathers-swagger](https://github.com/feathersjs-ecosystem/feathers-swagger), respectively.

The conveniences brought in by LoopBack come with a tradeoff of a large knowledge surface area. While LoopBack is a "convention-over-configuration" framework, Feathers (core) is a really small/lightweight library which gets out of your way, without enforcing any specific way of building your service-oriented APIs.