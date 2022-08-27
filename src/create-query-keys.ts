import type {
  DefaultKey,
  FactoryObject,
  FactoryOutput,
  FactoryOutputCallback,
  KeyScopeValue,
  QueryKeyFactoryResult,
  ValidateFactory,
} from './types';

export function createQueryKeys<Key extends string>(defaultKey: Key): DefaultKey<Key>;
export function createQueryKeys<Key extends string, FactorySchema extends FactoryObject>(
  defaultKey: Key,
  factorySchema: ValidateFactory<FactorySchema>,
): QueryKeyFactoryResult<Key, ValidateFactory<FactorySchema>>;

export function createQueryKeys<Key extends string, FactorySchema extends FactoryObject>(
  defaultKey: Key,
  factorySchema?: ValidateFactory<FactorySchema>,
): DefaultKey<Key> | QueryKeyFactoryResult<Key, ValidateFactory<FactorySchema>> {
  if (factorySchema == null) {
    return {
      default: [defaultKey] as const,
    };
  }

  const schemaKeys = assertSchemaKeys(factorySchema);

  function createKey<Scope extends string>(scope: Scope): readonly [Key, Scope];
  function createKey<Scope extends string, ScopeValue extends KeyScopeValue>(
    scope: Scope,
    scopeValue: ScopeValue,
  ): readonly [Key, Scope, ScopeValue];

  function createKey<Scope extends string, ScopeValue extends KeyScopeValue>(
    scope: Scope,
    scopeValue?: ScopeValue,
  ): readonly [Key, Scope] | readonly [Key, Scope, ScopeValue] {
    if (scopeValue != null) {
      return [defaultKey, scope, scopeValue] as const;
    }

    return [defaultKey, scope] as const;
  }

  type Factory = FactoryOutput<Key, FactorySchema>;

  const factory = schemaKeys.reduce((factoryMap, key) => {
    const currentValue = factorySchema[key];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let yieldValue: any;

    if (typeof currentValue === 'function') {
      type ResultCallback = FactoryOutputCallback<Key, typeof key, typeof currentValue>;

      const resultCallback: ResultCallback = (...args) => {
        const result = currentValue(...args);

        return createKey(key, result);
      };

      resultCallback.toScope = () => [defaultKey, key] as const;

      yieldValue = resultCallback;
    } else if (currentValue != null) {
      yieldValue = createKey(key, currentValue);
    } else {
      yieldValue = createKey(key);
    }

    factoryMap.set(key, yieldValue);

    return factoryMap;
  }, new Map<keyof Factory, Factory[keyof Factory]>());

  return {
    default: [defaultKey] as const,
    ...Object.fromEntries(factory),
  };
}

const assertSchemaKeys = (schema: Record<string, unknown>): string[] => {
  const schemaKeys = new Set(Object.keys(schema));

  if (schemaKeys.has('default')) {
    throw new Error(`"default" is a key reserved for the "createQueryKeys" function`);
  }

  return Array.from(schemaKeys);
};
