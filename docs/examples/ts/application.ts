import { feathers } from '@feathersjs/feathers'

type ServiceTypes = {
  // Add registered services here
}

// Types for `app.set(name, value)` and `app.get(name)`
type Configuration = {
  port: number
}

const app = feathers<ServiceTypes, Configuration>()
