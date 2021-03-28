import { CustomMethod } from '@feathersjs/feathers';
import { RestService } from '../src';

export type ServiceTypes = {
  todos: RestService & CustomMethod<'customMethod'>
}
