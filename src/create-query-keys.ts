import { omitPrototype, withDeprecatedApi } from './internals';
import type {
  DefaultKey,
  DefinitionKey,
  FactoryObject,
  KeyScopeTuple,
  KeyScopeValue,
  QueryKeyFactoryResult,
  ValidateFactory,
  AnyFactoryOutputCallback,
} from './types';

export function createQueryKeys<Key extends string>(queryDef: Key): DefaultKey<Key>;
export function createQueryKeys<Key extends string, FactorySchema extends FactoryObject>(
  queryDef: Key,
  schema: ValidateFactory<FactorySchema>,
): QueryKeyFactoryResult<Key, ValidateFactory<FactorySchema>>;

export function createQueryKeys<Key extends string, FactorySchema extends FactoryObject>(
  queryDef: Key,
  schema?: ValidateFactory<FactorySchema>,
): DefaultKey<Key> | QueryKeyFactoryResult<Key, ValidateFactory<FactorySchema>> {
  const defKey: DefinitionKey<Key> = {
    _def: [queryDef] as const,
  };

  if (schema == null) {
    /**
     * casting to satisfy type system that still includes "default"
     */
    return withDeprecatedApi(omitPrototype(defKey)) as DefaultKey<Key>;
  }

  const schemaKeys = assertSchemaKeys(schema);

  function createKey<Scope extends string>(scope: Scope): readonly [Key, Scope];
  function createKey<Scope extends string, Value extends KeyScopeValue>(
    scope: Scope,
    value: Value,
  ): readonly [Key, Scope, Value];
  function createKey<Scope extends string, Value extends KeyScopeTuple>(
    scope: Scope,
    value: Value,
  ): readonly [Key, Scope, ...Value];

  function createKey<Scope extends string, Value extends KeyScopeValue | KeyScopeTuple>(
    scope: Scope,
    value?: Value,
  ): readonly [Key, Scope] | readonly [Key, Scope, Value] | readonly [Key, Scope, ...KeyScopeTuple[]] {
    if (value != null) {
      if (Array.isArray(value)) {
        return [queryDef, scope, ...value] as const;
      }

      return [queryDef, scope, value] as const;
    }

    return [queryDef, scope] as const;
  }

  const factory = schemaKeys.reduce((factoryMap, key) => {
    const currentValue = schema[key];

    let yieldValue: any;

    if (typeof currentValue === 'function') {
      type $ResultCallback = AnyFactoryOutputCallback<Key>;

      const resultCallback: $ResultCallback = (...args) => {
        const result = currentValue(...args);

        /**
         * Array check is necessary so that the correct
         * createKey overload is called
         */
        if (Array.isArray(result)) {
          return createKey(key, result);
        }

        return createKey(key, result);
      };

      resultCallback._def = [queryDef, key] as const;

      yieldValue = resultCallback;
    } else if (currentValue != null) {
      yieldValue = createKey(key, currentValue);
    } else {
      yieldValue = createKey(key);
    }

    factoryMap.set(key, yieldValue);
    return factoryMap;
  }, new Map());

  /**
   * casting to satisfy type system that still includes deprecated API
   */
  return withDeprecatedApi(
    omitPrototype({
      ...Object.fromEntries(factory),
      ...defKey,
    }),
  ) as QueryKeyFactoryResult<Key, ValidateFactory<FactorySchema>>;
}

const assertSchemaKeys = (schema: Record<string, unknown>): string[] => {
  const keysSet = new Set(Object.keys(schema).sort((a, b) => a.localeCompare(b)));

  if (keysSet.has('default')) {
    throw new Error('"default" is a key reserved for the query key factory');
  }

  const keys = Array.from(keysSet);

  const hasKeyInShapeOfInternalKey = keys.some((key) => key.startsWith('_'));

  if (hasKeyInShapeOfInternalKey) {
    throw new Error('Keys that start with "_" are reserved for the query key factory');
  }

  return keys;
};
