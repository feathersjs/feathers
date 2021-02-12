// import { feathers, ServiceMethods, Params } from '../src';

// describe.only('Feathers Typings', () => {
//   interface Todo {
//     id: number;
//     message: string;
//     completed: boolean;
//   }

//   class TodoService implements Partial<ServiceMethods<Todo>> {
//     async create (data: Todo, _params?: Params) {
//       return data;
//     }
//   }

//   type Services = {
//     test: TodoService;
//   }
//   const app = feathers<Services>();

//   app.use('test', new TodoService());

//   // app.service('test').hooks()
// });
