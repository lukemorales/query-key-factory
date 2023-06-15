import type { AnyQueryKeyFactoryResult } from './create-query-keys.types';
import { type Add, omitPrototype } from './internals';

type StoreFromMergedQueryKeys<
  QueryKeyFactoryResults extends AnyQueryKeyFactoryResult[],
  CurrentIndex extends number = 0,
> = QueryKeyFactoryResults[CurrentIndex] extends null | undefined
  ? {}
  : {
      [P in QueryKeyFactoryResults[CurrentIndex]['_def'][0]]: QueryKeyFactoryResults[CurrentIndex];
    } & StoreFromMergedQueryKeys<QueryKeyFactoryResults, Add<CurrentIndex, 1>>;

export function mergeQueryKeys<QueryKeyFactoryResults extends AnyQueryKeyFactoryResult[]>(
  ...schemas: QueryKeyFactoryResults
): StoreFromMergedQueryKeys<QueryKeyFactoryResults> {
  const store = schemas.reduce((storeMap, current) => {
    const [storeKey] = current._def;

    storeMap.set(storeKey, current);
    return storeMap;
  }, new Map());

  return omitPrototype(Object.fromEntries(store));
}
