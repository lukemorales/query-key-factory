import { omitPrototype } from './internals';
import type {
  DefinitionKey,
  FactorySchema,
  QueryKeyFactoryResult,
  ValidateFactory,
  AnyFactoryOutputCallback,
  AnyQueryKey,
} from './types';

export function createQueryKeys<Key extends string>(queryDef: Key): DefinitionKey<Key>;
export function createQueryKeys<Key extends string, Schema extends FactorySchema>(
  queryDef: Key,
  schema: ValidateFactory<Schema>,
): QueryKeyFactoryResult<Key, ValidateFactory<Schema>>;
export function createQueryKeys<Key extends string, Schema extends FactorySchema>(
  queryDef: Key,
  schema?: ValidateFactory<Schema>,
): DefinitionKey<Key> | QueryKeyFactoryResult<Key, ValidateFactory<Schema>> {
  const defKey: DefinitionKey<Key> = {
    _def: [queryDef] as const,
  };

  if (schema == null) {
    return omitPrototype(defKey);
  }

  const transformSchema = (targetSchema: FactorySchema, mainKey: AnyQueryKey) => {
    const keys = assertSchemaKeys(targetSchema);

    return keys.reduce((factoryMap, factoryKey) => {
      const value = targetSchema[factoryKey];
      const key = [...mainKey, factoryKey] as const;

      let yieldValue: any;

      if (typeof value === 'function') {
        const resultCallback: AnyFactoryOutputCallback = (...args) => {
          const result = value(...args);

          if (Array.isArray(result)) {
            return [...key, ...result] as const;
          }

          const innerKey = [...key, ...result.def] as const;

          const transformedSchema = transformSchema(result.keys, innerKey);

          return omitPrototype({
            ...omitPrototype(Object.fromEntries(transformedSchema)),
            _def: innerKey,
          });
        };

        resultCallback._def = key;

        yieldValue = resultCallback;
      } else if (value != null) {
        yieldValue = [...key, ...value] as const;
      } else {
        yieldValue = key;
      }

      factoryMap.set(factoryKey, yieldValue);
      return factoryMap;
    }, new Map());
  };

  const transformedSchema = transformSchema(schema, defKey._def);

  return omitPrototype({
    ...Object.fromEntries(transformedSchema),
    ...defKey,
  });
}

/**
 * @internal
 */
const assertSchemaKeys = (schema: Record<string, unknown>): string[] => {
  const keys = Object.keys(schema).sort((a, b) => a.localeCompare(b));

  const hasKeyInShapeOfInternalKey = keys.some((key) => key.startsWith('_'));

  if (hasKeyInShapeOfInternalKey) {
    throw new Error('Keys that start with "_" are reserved for the Query Key Factory');
  }

  return keys;
};
