import { createQueryKeys } from './create-query-keys';
import type { QueryFactorySchema, QueryKeyFactoryResult } from './create-query-keys.types';
import type { DefinitionKey } from './types';
import { omitPrototype } from './internals';

type QueryKeyStoreSchema = Record<string, null | QueryFactorySchema>;

export type QueryKeyStore<StoreSchema extends QueryKeyStoreSchema> = {
  [P in keyof StoreSchema & string]: StoreSchema[P] extends QueryFactorySchema
    ? QueryKeyFactoryResult<P, StoreSchema[P]>
    : DefinitionKey<[P]>;
};

export function createQueryKeyStore<StoreSchema extends QueryKeyStoreSchema>(
  schema: StoreSchema,
): QueryKeyStore<StoreSchema> {
  const keys = Object.keys(schema);

  const store = keys.reduce((storeMap, key) => {
    const factory = schema[key];

    const result = factory ? createQueryKeys(key, factory) : createQueryKeys(key);

    storeMap.set(key, result);
    return storeMap;
  }, new Map());

  return omitPrototype(Object.fromEntries(store));
}
