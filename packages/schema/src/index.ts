export * from './schema';
export * from './resolver';
export * from './hooks';
export * from './feathers';

export type Infer<S extends { _type: any }> = S['_type'];
