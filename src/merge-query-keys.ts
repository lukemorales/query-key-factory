import { omitPrototype } from './internals';
import { AnyQueryKeyFactoryResult, StoreFromMergedQueryKeys } from './types';

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
