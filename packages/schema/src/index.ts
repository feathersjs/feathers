export * from './schema';
export * from './resolver';
export * from './hooks';

export type Infer<S extends { _type: any }, R = {}>
  = Omit<S['_type'], keyof (R extends { _type: any } ? R['_type'] : R)>
    & (R extends { _type: any } ? R['_type'] : R);

// declare module '@feathersjs/feathers/lib/declarations' {
//   export interface ServiceOptions {
//     schema?: {
//       query?: Schema<any>,
//       data?: Schema<any>,
//       result?: Schema<any>
//     }
//   }
// }
