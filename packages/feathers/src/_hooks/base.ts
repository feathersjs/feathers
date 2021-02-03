// import { _ } from '@feathersjs/commons';
// import { HookContext } from '../declarations';

// export const assignArguments = (context: HookContext, next: any) => {
//   const { service, method } = context;
//   const parameters = service.methods[method];

//   context.arguments.forEach((value, index) => {
//     (context as any)[parameters[index]] = value;
//   });

//   if (!context.params) {
//     context.params = {};
//   }

//   return next();
// };

// export const validate = (context: HookContext, next: any) => {
//   const { service, method, path } = context;
//   const parameters = service.methods[method];

//   if (parameters.includes('id') && context.id === undefined) {
//     throw new Error(`An id must be provided to the '${path}.${method}' method`);
//   }

//   if (parameters.includes('data') && !_.isObjectOrArray(context.data)) {
//     throw new Error(`A data object must be provided to the '${path}.${method}' method`);
//   }

//   return next();
// };
