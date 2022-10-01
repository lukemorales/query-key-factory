import { omitPrototype } from './internals';
import { QueryFunctionContext } from './query-context.types';
import type {
  DefinitionKey,
  FactorySchema,
  QueryKeyFactoryResult,
  ValidateFactory,
  AnyFactoryOutputCallback,
  AnyQueryKey,
  CallbackContext,
} from './types';

export function createQueryKeys<Key extends string>(queryDef: Key): DefinitionKey<Key>;
export function createQueryKeys<Key extends string, Schema extends FactorySchema>(
  queryDef: Key,
  schema: ValidateFactory<Schema>,
): QueryKeyFactoryResult<Key, Schema>;
export function createQueryKeys<Key extends string, Schema extends FactorySchema>(
  queryDef: Key,
  schema?: ValidateFactory<Schema>,
): DefinitionKey<Key> | QueryKeyFactoryResult<Key, Schema> {
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

          const innerKey = [...key, ...(result.def ?? [])] as const;

          if ('queryFn' in result) {
            type $QueryFnContext = Omit<QueryFunctionContext<typeof innerKey, any>, 'queryKey'>;

            const context: CallbackContext<typeof innerKey, typeof result['queryFn']> = {
              queryFn: (queryFnContext: Partial<$QueryFnContext>) =>
                result.queryFn({ ...queryFnContext, queryKey: innerKey, meta: queryFnContext.meta ?? undefined }),
              queryOptions: {
                queryKey: innerKey,
                queryFn: result.queryFn,
              },
            };

            if ('queries' in result) {
              const transformedSchema = transformSchema(result.queries, innerKey);

              return omitPrototype({
                ...omitPrototype(Object.fromEntries(transformedSchema)),
                _def: innerKey,
                _ctx: omitPrototype(context),
              });
            }

            return omitPrototype({
              _def: innerKey,
              _ctx: omitPrototype(context),
            });
          }

          const transformedSchema = transformSchema(result.queries, innerKey);

          return omitPrototype({
            ...omitPrototype(Object.fromEntries(transformedSchema)),
            _def: innerKey,
          });
        };

        resultCallback._def = key;

        yieldValue = resultCallback;
      } else if (value == null) {
        yieldValue = key;
      } else if (Array.isArray(value)) {
        yieldValue = [...key, ...value] as const;
      } else if ('queryFn' in value) {
        type $QueryFnContext = Omit<QueryFunctionContext<typeof innerKey, any>, 'queryKey'>;

        const innerKey = [...key, ...(value.def ?? [])] as const;

        const context: CallbackContext<typeof innerKey, typeof value['queryFn']> = {
          queryFn: (queryFnContext?: Partial<$QueryFnContext>) =>
            value.queryFn({ ...queryFnContext, queryKey: innerKey, meta: queryFnContext?.meta ?? undefined }),
          queryOptions: {
            queryKey: innerKey,
            queryFn: value.queryFn,
          },
        };

        if ('queries' in value) {
          const transformedSchema = transformSchema(value.queries, innerKey);

          yieldValue = omitPrototype({
            ...omitPrototype(Object.fromEntries(transformedSchema)),
            _def: innerKey,
            _ctx: omitPrototype(context),
          });
        } else {
          yieldValue = omitPrototype({
            _def: innerKey,
            _ctx: omitPrototype(context),
          });
        }
      } else {
        const innerKey = [...key, ...(value.def ?? [])] as const;
        const transformedSchema = transformSchema(value.queries, innerKey);

        yieldValue = omitPrototype({
          ...omitPrototype(Object.fromEntries(transformedSchema)),
          _def: innerKey,
        });
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
