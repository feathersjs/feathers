import { CustomMethods } from '@feathersjs/feathers'
import { RestService } from '../src'

export type ServiceTypes = {
  todos: RestService & CustomMethods<{ customMethod: any }>
}
