import type {
  MutationFactorySchema,
  MutationKeyFactoryResult,
  AnyMutationFactoryOutputCallback,
  ValidateFactory,
  AnyMutationKey,
} from './create-mutation-keys.types';
import { assertSchemaKeys, omitPrototype } from './internals';
import type { DefinitionKey } from './types';

/**
 * @deprecated the type inference for this function is broken and will be fixed in the next patch version
 * or possibly removed and implemented differently in a major version
 */
export function createMutationKeys<Key extends string>(mutationDef: Key): DefinitionKey<[Key]>;
/**
 * @deprecated the type inference for this function is broken and will be fixed in the next patch version
 * or possibly removed and implemented differently in a major version
 */
export function createMutationKeys<Key extends string, Schema extends MutationFactorySchema>(
  mutationDef: Key,
  schema: ValidateFactory<Schema>,
): MutationKeyFactoryResult<Key, Schema>;
/**
 * @deprecated the type inference for this function is broken and will be fixed in the next patch version
 * or possibly removed and implemented differently in a major version
 */
export function createMutationKeys<Key extends string, Schema extends MutationFactorySchema>(
  mutationDef: Key,
  schema?: ValidateFactory<Schema>,
): DefinitionKey<[Key]> | MutationKeyFactoryResult<Key, Schema> {
  const defKey: DefinitionKey<[Key]> = {
    _def: [mutationDef] as const,
  };

  if (schema == null) {
    return omitPrototype(defKey);
  }

  const transformSchema = <$Factory extends MutationFactorySchema>(factory: $Factory, mainKey: AnyMutationKey) => {
    type $FactoryProperty = keyof $Factory;

    const keys = assertSchemaKeys(factory);
    return keys.reduce((factoryMap, factoryKey) => {
      const value = factory[factoryKey];
      const key = [...mainKey, factoryKey] as const;

      const isReadonlyArray = (arg: unknown): arg is readonly any[] => Array.isArray(arg);

      let yieldValue: any;

      if (typeof value === 'function') {
        const resultCallback: AnyMutationFactoryOutputCallback = (...args) => {
          const result = value(...args);

          if (isReadonlyArray(result)) {
            return omitPrototype({
              mutationKey: [...key, ...result] as const,
            });
          }

          const innerKey = [...key, ...result.mutationKey] as const;

          if ('mutationFn' in result) {
            const queryOptions = {
              mutationKey: innerKey,
              mutationFn: result.mutationFn,
            };

            if ('contextMutations' in result) {
              const transformedSchema = transformSchema(result.contextMutations, innerKey);

              return omitPrototype({
                _ctx: omitPrototype(Object.fromEntries(transformedSchema)),
                ...queryOptions,
              });
            }

            return omitPrototype({
              ...queryOptions,
            });
          }

          if ('contextMutations' in result) {
            const transformedSchema = transformSchema(result.contextMutations, innerKey);

            return omitPrototype({
              _ctx: omitPrototype(Object.fromEntries(transformedSchema)),
              mutationKey: innerKey,
            });
          }

          return omitPrototype({
            mutationKey: innerKey,
          });
        };

        resultCallback._def = key;

        yieldValue = resultCallback;
      } else if (value == null) {
        yieldValue = omitPrototype({
          mutationKey: key,
        });
      } else if (isReadonlyArray(value)) {
        yieldValue = omitPrototype({
          _def: key,
          mutationKey: [...key, ...value] as const,
        });
      } else if ('mutationFn' in value) {
        const innerDefKey = { ...(value.mutationKey ? { _def: key } : undefined) };
        const innerKey = [...key, ...(value.mutationKey ?? [])] as const;

        const queryOptions = {
          mutationKey: innerKey,
          mutationFn: value.mutationFn,
        };

        if ('contextMutations' in value) {
          const transformedSchema = transformSchema(value.contextMutations, innerKey);

          yieldValue = omitPrototype({
            _ctx: omitPrototype(Object.fromEntries(transformedSchema)),
            ...innerDefKey,
            ...queryOptions,
          });
        } else {
          yieldValue = omitPrototype({ ...innerDefKey, ...queryOptions });
        }
      } else if ('contextMutations' in value) {
        const innerDefKey = { ...(value.mutationKey ? { _def: key } : undefined) };
        const innerKey = [...key, ...(value.mutationKey ?? [])] as const;

        const transformedSchema = transformSchema(value.contextMutations, innerKey);

        yieldValue = omitPrototype({
          _ctx: omitPrototype(Object.fromEntries(transformedSchema)),
          mutationKey: innerKey,
          ...innerDefKey,
        });
      } else {
        const innerDefKey = { ...(value.mutationKey ? { _def: key } : undefined) };
        const innerKey = [...key, ...(value.mutationKey ?? [])] as const;

        yieldValue = omitPrototype({
          mutationKey: innerKey,
          ...innerDefKey,
        });
      }

      factoryMap.set(factoryKey, yieldValue);
      return factoryMap;
    }, new Map<$FactoryProperty, $Factory[$FactoryProperty]>());
  };

  const transformedSchema = transformSchema(schema, defKey._def);

  return omitPrototype({
    ...Object.fromEntries(transformedSchema),
    ...defKey,
  });
}
