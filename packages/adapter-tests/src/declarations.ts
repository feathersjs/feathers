export type AdapterTest = (name: AdapterTestName, runner: any) => void;

export type AdapterBasicTest = (name: AdapterBasicTestName, runner: any) => void;
export type AdapterMethodsTest = (name: AdapterMethodsTestName, runner: any) => void;
export type AdapterSyntaxTest = (name: AdapterSyntaxTestName, runner: any) => void;

export type AdapterTestName = AdapterBasicTestName | AdapterMethodsTestName | AdapterSyntaxTestName;

export type AdapterBasicTestName =
  '.id' |
  '.options' |
  '.events' |
  '._get' |
  '._find' |
  '._create' |
  '._update' |
  '._patch' |
  '._remove';

export type AdapterMethodsTestName =
  '.get' |
  '.get + $select' |
  '.get + id + query' |
  '.get + NotFound' |
  '.get + id + query id' |
  '.find' |
  '.remove' |
  '.remove + $select' |
  '.remove + id + query' |
  '.remove + multi' |
  '.remove + multi no pagination' |
  '.remove + id + query id' |
  '.update' |
  '.update + $select' |
  '.update + id + query' |
  '.update + NotFound' |
  '.update + query + NotFound' |
  '.update + id + query id' |
  '.patch' |
  '.patch + $select' |
  '.patch + id + query' |
  '.patch multiple' |
  '.patch multiple no pagination' |
  '.patch multi query same' |
  '.patch multi query changed' |
  '.patch + NotFound' |
  '.patch + query + NotFound' |
  '.patch + id + query id' |
  '.create' |
  '.create + $select' |
  '.create multi' |
  'internal .find' |
  'internal .get' |
  'internal .create' |
  'internal .update' |
  'internal .patch' |
  'internal .remove';

export type AdapterSyntaxTestName =
  '.find + equal' |
  '.find + equal multiple' |
  '.find + $sort' |
  '.find + $sort + string' |
  '.find + $limit' |
  '.find + $limit 0' |
  '.find + $skip' |
  '.find + $select' |
  '.find + $or' |
  '.find + $in' |
  '.find + $nin' |
  '.find + $lt' |
  '.find + $lte' |
  '.find + $gt' |
  '.find + $gte' |
  '.find + $ne' |
  '.find + $gt + $lt + $sort' |
  '.find + $or nested + $sort' |
  'params.adapter + paginate' |
  'params.adapter + multi' |
  '.find + paginate' |
  '.find + paginate + query' |
  '.find + paginate + $limit + $skip' |
  '.find + paginate + $limit 0' |
  '.find + paginate + params';