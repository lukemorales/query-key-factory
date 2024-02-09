import { type AnyMutationKeyFactoryResult } from './create-mutation-keys.types';
import type { AnyQueryKeyFactoryResult } from './create-query-keys.types';
import { omitPrototype } from './internals';
import type { Prettify } from './types';

type StoreFromMergedQueryKeys<
  QueryOrMutationKeyFactoryResults extends Array<AnyQueryKeyFactoryResult | AnyMutationKeyFactoryResult>,
> = QueryOrMutationKeyFactoryResults extends [
  infer First extends AnyQueryKeyFactoryResult | AnyMutationKeyFactoryResult,
  ...infer Rest extends AnyQueryKeyFactoryResult[] | AnyMutationKeyFactoryResult[],
]
  ? { [P in First['_def'][0]]: First } & StoreFromMergedQueryKeys<Rest>
  : {};

export function mergeQueryKeys<
  QueryKeyFactoryResults extends Array<AnyQueryKeyFactoryResult | AnyMutationKeyFactoryResult>,
>(...schemas: QueryKeyFactoryResults): Prettify<StoreFromMergedQueryKeys<QueryKeyFactoryResults>> {
  const store = schemas.reduce((storeMap, current) => {
    const [storeKey] = current._def;

    storeMap.set(storeKey, { ...storeMap.get(storeKey), ...current });
    return storeMap;
  }, new Map());

  return omitPrototype(Object.fromEntries(store));
}
