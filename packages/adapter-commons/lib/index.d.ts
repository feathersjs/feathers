export { AdapterService, InternalServiceMethods, ServiceOptions } from './service';
export { default as filterQuery, FILTERS, OPERATORS } from './filter-query';
export * from './sort';
export declare function select (params: any, ...otherFields: any[]): (result: any) => any;
