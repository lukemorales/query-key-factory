import { type Prettify } from './internals';
import { omitPrototype } from './omit-prototype';

type AnyQueryKeyFactoryResult = any;

type StoreFromQueries<QueryOrMutationKeyFactoryResults extends AnyQueryKeyFactoryResult[]> =
  QueryOrMutationKeyFactoryResults extends [
    infer First extends AnyQueryKeyFactoryResult,
    ...infer Rest extends AnyQueryKeyFactoryResult[],
  ]
    ? // @ts-expect-error not implemented yet
      { [P in First['$def'][0]]: First } & StoreFromQueries<Rest>
    : {};

export function createStoreFromQueries<QueryKeyFactoryResults extends AnyQueryKeyFactoryResult[]>(
  ...schemas: QueryKeyFactoryResults
): Prettify<StoreFromQueries<QueryKeyFactoryResults>> {
  const store = schemas.reduce((storeMap, current) => {
    const [storeKey] = current._def;

    storeMap.set(storeKey, { ...storeMap.get(storeKey), ...current });
    return storeMap;
  }, new Map());

  return omitPrototype(Object.fromEntries(store)) as any;
}
