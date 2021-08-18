---
to: "<%= h.lib %>/services/<%= path %>.ts"
inject: true
prepend: true
---
import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '<%= relative %>/declarations';