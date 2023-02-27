import { omitPrototype } from './internals';
import { AnyMutationKeyFactoryResult, AnyQueryKeyFactoryResult, StoreFromMergedQueryKeys } from './types';

export function mergeQueryKeys<
  QueryKeyFactoryResults extends Array<AnyQueryKeyFactoryResult | AnyMutationKeyFactoryResult>,
>(...schemas: QueryKeyFactoryResults): StoreFromMergedQueryKeys<QueryKeyFactoryResults> {
  const store = schemas.reduce((storeMap, current) => {
    const [storeKey] = current._def;

    storeMap.set(storeKey, { ...storeMap.get(storeKey), ...current });
    return storeMap;
  }, new Map());

  return omitPrototype(Object.fromEntries(store));
}
