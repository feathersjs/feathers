import { CustomMethod } from '@feathersjs/feathers'
import { RestService } from '../src/index'

type Data = { message: string }
type Result = {
  data: Data
  provider: string
  type: string
}

export type ServiceTypes = {
  todos: RestService & {
    customMethod: CustomMethod<Data, Result>
  }
}
