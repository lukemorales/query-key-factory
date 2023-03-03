import type { QueryFunction, MutateFunction } from '@tanstack/query-core';

import { Add, ExtractInternalKeys } from './internals';

type MergeInsertions<T> = T extends object ? { [K in keyof T]: MergeInsertions<T[K]> } : T;

export type AnyQueryKey = readonly [string, ...any[]];
export type AnyMutationKey = AnyQueryKey;

type AnyMutableOrReadonlyArray = any[] | readonly any[];

type Tuple = [ValidValue, ...Array<ValidValue | undefined>];

export type KeyTuple = Tuple | Readonly<Tuple>;

export type ValidValue = string | number | boolean | object;

type NullableQueryKeyRecord = Record<'queryKey', KeyTuple | null>;
type NullableMutationKeyRecord = Record<'mutationKey', KeyTuple | null>;

type QueryKeyRecord = Record<'queryKey', KeyTuple>;
type MutationKeyRecord = Record<'mutationKey', KeyTuple>;

type QueryKeySchemaWithContextualQueries = NullableQueryKeyRecord & {
  contextQueries: QueryFactorySchema;
};

type MutationKeySchemaWithContextualMutations = NullableMutationKeyRecord & {
  contextMutations: MutationFactorySchema;
};

type $QueryFactorySchema = NullableQueryKeyRecord & {
  queryFn: QueryFunction;
};

type $MutationFactorySchema = NullableMutationKeyRecord & {
  mutationFn: MutateFunction;
};

type QueryFactoryWithContextualQueriesSchema = NullableQueryKeyRecord & {
  queryFn: QueryFunction;
  contextQueries: QueryFactorySchema;
};

type MutationFactoryWithContextualMutationsSchema = NullableMutationKeyRecord & {
  mutationFn: MutateFunction;
  contextMutations: MutationFactorySchema;
};

type DynamicQueryKeySchemaWithContextualQueries = QueryKeyRecord & {
  contextQueries: QueryFactorySchema;
};

type DynamicMutationKeySchemaWithContextualMutations = MutationKeyRecord & {
  contextMutations: MutationFactorySchema;
};

type DynamicQueryFactorySchema = QueryKeyRecord & {
  queryFn: QueryFunction;
};

type DynamicMutationFactorySchema = MutationKeyRecord & {
  mutationFn: MutateFunction;
};

type DynamicQueryFactoryWithContextualQueriesSchema = QueryKeyRecord & {
  queryFn: QueryFunction;
  contextQueries: QueryFactorySchema;
};

type DynamicMutationFactoryWithContextualMutationsSchema = MutationKeyRecord & {
  mutationFn: MutateFunction;
  contextMutations: MutationFactorySchema;
};

type QueryFactoryProperty =
  | null
  | KeyTuple
  | NullableQueryKeyRecord
  | QueryKeySchemaWithContextualQueries
  | $QueryFactorySchema
  | QueryFactoryWithContextualQueriesSchema;

type MutationFactoryProperty =
  | null
  | KeyTuple
  | NullableMutationKeyRecord
  | MutationKeySchemaWithContextualMutations
  | $MutationFactorySchema
  | MutationFactoryWithContextualMutationsSchema;

type QueryDynamicKey = (
  ...args: any[]
) =>
  | DynamicQueryFactoryWithContextualQueriesSchema
  | DynamicQueryFactorySchema
  | DynamicQueryKeySchemaWithContextualQueries
  | QueryKeyRecord
  | KeyTuple;

type MutationDynamicKey = (
  ...args: any[]
) =>
  | DynamicMutationFactoryWithContextualMutationsSchema
  | DynamicMutationFactorySchema
  | DynamicMutationKeySchemaWithContextualMutations
  | MutationKeyRecord
  | KeyTuple;

export type QueryFactorySchema = Record<string, QueryFactoryProperty | QueryDynamicKey>;
export type MutationFactorySchema = Record<string, MutationFactoryProperty | MutationDynamicKey>;

type InvalidSchema<Schema extends QueryFactorySchema | MutationFactorySchema> = Omit<Schema, `_${string}`>;

export type ValidateFactory<Schema extends QueryFactorySchema | MutationFactorySchema> = Schema extends {
  [P in ExtractInternalKeys<Schema>]: Schema[P];
}
  ? InvalidSchema<Schema>
  : Schema;

type ExtractNullableKey<Key extends KeyTuple | null | undefined> = Key extends
  | [...infer Value]
  | readonly [...infer Value]
  ? Value
  : Key extends null | undefined | unknown
  ? null
  : never;

type ComposeQueryKey<BaseKey extends AnyMutableOrReadonlyArray, Key> = Key extends KeyTuple
  ? readonly [...BaseKey, ...Key]
  : readonly [...BaseKey];

export type QueryOptions<
  Keys extends AnyMutableOrReadonlyArray,
  Fetcher extends QueryFunction,
  FetcherResult extends ReturnType<Fetcher> = ReturnType<Fetcher>,
> = {
  queryKey: readonly [...Keys];
  queryFn: QueryFunction<Awaited<FetcherResult>, readonly [...Keys]>;
};

export type MutationOptions<
  Keys extends AnyMutableOrReadonlyArray,
  Fetcher extends MutateFunction,
  FetcherResult extends ReturnType<Fetcher> = ReturnType<Fetcher>,
  FetcherVariables extends Parameters<Fetcher>[0] = Parameters<Fetcher>[0],
> = {
  mutationKey: readonly [...Keys];
  mutationFn: MutateFunction<Awaited<FetcherResult>, unknown, FetcherVariables, unknown>;
};

type QueryFactoryWithContextualQueriesOutput<
  BaseKey extends AnyMutableOrReadonlyArray,
  Schema extends QueryKeySchemaWithContextualQueries | DynamicQueryKeySchemaWithContextualQueries,
  SchemaQueryKey extends Schema['queryKey'] = Schema['queryKey'],
  ContextQueries extends Schema['contextQueries'] = Schema['contextQueries'],
  ComposedKey extends AnyMutableOrReadonlyArray = ComposeQueryKey<BaseKey, ExtractNullableKey<SchemaQueryKey>>,
> = SchemaQueryKey extends null
  ? Omit<QueryOptions<ComposedKey, QueryFunction>, 'queryFn'> & {
      _ctx: {
        [P in keyof ContextQueries]: ContextQueries[P] extends QueryDynamicKey
          ? DynamicQueryFactoryOutput<[...ComposedKey, P], ContextQueries[P]>
          : ContextQueries[P] extends QueryFactoryProperty
          ? StaticQueryFactoryOutput<[...ComposedKey, P], ContextQueries[P]>
          : never;
      };
    }
  : Omit<QueryOptions<ComposedKey, QueryFunction>, 'queryFn'> &
      DefinitionKey<BaseKey> & {
        _ctx: {
          [P in keyof ContextQueries]: ContextQueries[P] extends QueryDynamicKey
            ? DynamicQueryFactoryOutput<[...ComposedKey, P], ContextQueries[P]>
            : ContextQueries[P] extends QueryFactoryProperty
            ? StaticQueryFactoryOutput<[...ComposedKey, P], ContextQueries[P]>
            : never;
        };
      };

type MutationFactoryWithContextualQueriesOutput<
  BaseKey extends AnyMutableOrReadonlyArray,
  Schema extends MutationKeySchemaWithContextualMutations | DynamicMutationKeySchemaWithContextualMutations,
  SchemaMutationKey extends Schema['mutationKey'] = Schema['mutationKey'],
  ContextMutations extends Schema['contextMutations'] = Schema['contextMutations'],
  ComposedKey extends AnyMutableOrReadonlyArray = ComposeQueryKey<BaseKey, ExtractNullableKey<SchemaMutationKey>>,
> = SchemaMutationKey extends null
  ? Omit<MutationOptions<ComposedKey, MutateFunction>, 'mutationFn'> & {
      _ctx: {
        [P in keyof ContextMutations]: ContextMutations[P] extends MutationDynamicKey
          ? DynamicMutationFactoryOutput<[...ComposedKey, P], ContextMutations[P]>
          : ContextMutations[P] extends MutationFactoryProperty
          ? StaticMutationFactoryOutput<[...ComposedKey, P], ContextMutations[P]>
          : never;
      };
    }
  : Omit<MutationOptions<ComposedKey, MutateFunction>, 'mutationFn'> &
      DefinitionKey<BaseKey> & {
        _ctx: {
          [P in keyof ContextMutations]: ContextMutations[P] extends MutationDynamicKey
            ? DynamicMutationFactoryOutput<[...ComposedKey, P], ContextMutations[P]>
            : ContextMutations[P] extends MutationFactoryProperty
            ? StaticMutationFactoryOutput<[...ComposedKey, P], ContextMutations[P]>
            : never;
        };
      };

type FactoryQueryKeyRecordOutput<
  BaseKey extends AnyMutableOrReadonlyArray,
  Schema extends NullableQueryKeyRecord | QueryKeyRecord,
  SchemaQueryKey extends Schema['queryKey'] = Schema['queryKey'],
  ComposedKey extends AnyMutableOrReadonlyArray = ComposeQueryKey<BaseKey, ExtractNullableKey<SchemaQueryKey>>,
> = SchemaQueryKey extends null
  ? Omit<QueryOptions<BaseKey, QueryFunction>, 'queryFn'>
  : Omit<QueryOptions<ComposedKey, QueryFunction>, 'queryFn'> & DefinitionKey<BaseKey>;

type FactoryMutationKeyRecordOutput<
  BaseKey extends AnyMutableOrReadonlyArray,
  Schema extends NullableMutationKeyRecord | MutationKeyRecord,
  SchemaMutationKey extends Schema['mutationKey'] = Schema['mutationKey'],
  ComposedKey extends AnyMutableOrReadonlyArray = ComposeQueryKey<BaseKey, ExtractNullableKey<SchemaMutationKey>>,
> = SchemaMutationKey extends null
  ? Omit<MutationOptions<BaseKey, MutateFunction>, 'mutationFn'>
  : Omit<MutationOptions<ComposedKey, MutateFunction>, 'mutationFn'> & DefinitionKey<BaseKey>;

type FactoryQueryOptionsOutput<
  BaseKey extends AnyMutableOrReadonlyArray,
  Schema extends $QueryFactorySchema | DynamicQueryFactorySchema,
  SchemaQueryKey extends Schema['queryKey'] = Schema['queryKey'],
  QueryFn extends Schema['queryFn'] = Schema['queryFn'],
  ComposedKey extends AnyMutableOrReadonlyArray = ComposeQueryKey<BaseKey, ExtractNullableKey<SchemaQueryKey>>,
> = SchemaQueryKey extends null
  ? QueryOptions<BaseKey, QueryFn>
  : QueryOptions<ComposedKey, QueryFn> & DefinitionKey<BaseKey>;

type FactoryMutationOptionsOutput<
  BaseKey extends AnyMutableOrReadonlyArray,
  Schema extends $MutationFactorySchema | DynamicMutationFactorySchema,
  SchemaQueryKey extends Schema['mutationKey'] = Schema['mutationKey'],
  MutationFn extends Schema['mutationFn'] = Schema['mutationFn'],
  ComposedKey extends AnyMutableOrReadonlyArray = ComposeQueryKey<BaseKey, ExtractNullableKey<SchemaQueryKey>>,
> = SchemaQueryKey extends null
  ? MutationOptions<BaseKey, MutationFn>
  : MutationOptions<ComposedKey, MutationFn> & DefinitionKey<BaseKey>;

type FactoryQueryOptionsWithContextualQueriesOutput<
  BaseKey extends AnyMutableOrReadonlyArray,
  Schema extends QueryFactoryWithContextualQueriesSchema | DynamicQueryFactoryWithContextualQueriesSchema,
  SchemaQueryKey extends Schema['queryKey'] = Schema['queryKey'],
  QueryFn extends Schema['queryFn'] = Schema['queryFn'],
  ContextQueries extends Schema['contextQueries'] = Schema['contextQueries'],
  Key extends AnyMutableOrReadonlyArray = ComposeQueryKey<BaseKey, ExtractNullableKey<SchemaQueryKey>>,
> = SchemaQueryKey extends null
  ? QueryOptions<Key, QueryFn> & {
      _ctx: {
        [P in keyof ContextQueries]: ContextQueries[P] extends QueryDynamicKey
          ? DynamicQueryFactoryOutput<[...Key, P], ContextQueries[P]>
          : ContextQueries[P] extends QueryFactoryProperty
          ? StaticQueryFactoryOutput<[...Key, P], ContextQueries[P]>
          : never;
      };
    }
  : DefinitionKey<BaseKey> &
      QueryOptions<Key, QueryFn> & {
        _ctx: {
          [P in keyof ContextQueries]: ContextQueries[P] extends QueryDynamicKey
            ? DynamicQueryFactoryOutput<[...Key, P], ContextQueries[P]>
            : ContextQueries[P] extends QueryFactoryProperty
            ? StaticQueryFactoryOutput<[...Key, P], ContextQueries[P]>
            : never;
        };
      };

type FactoryMutationOptionsWithContextualQueriesOutput<
  BaseKey extends AnyMutableOrReadonlyArray,
  Schema extends MutationFactoryWithContextualMutationsSchema | DynamicMutationFactoryWithContextualMutationsSchema,
  SchemaQueryKey extends Schema['mutationKey'] = Schema['mutationKey'],
  MutationFn extends Schema['mutationFn'] = Schema['mutationFn'],
  ContextMutations extends Schema['contextMutations'] = Schema['contextMutations'],
  Key extends AnyMutableOrReadonlyArray = ComposeQueryKey<BaseKey, ExtractNullableKey<SchemaQueryKey>>,
> = SchemaQueryKey extends null
  ? MutationOptions<Key, MutationFn> & {
      _ctx: {
        [P in keyof ContextMutations]: ContextMutations[P] extends MutationDynamicKey
          ? DynamicMutationFactoryOutput<[...Key, P], ContextMutations[P]>
          : ContextMutations[P] extends MutationFactoryProperty
          ? StaticMutationFactoryOutput<[...Key, P], ContextMutations[P]>
          : never;
      };
    }
  : DefinitionKey<BaseKey> &
      MutationOptions<Key, MutationFn> & {
        _ctx: {
          [P in keyof ContextMutations]: ContextMutations[P] extends MutationDynamicKey
            ? DynamicMutationFactoryOutput<[...Key, P], ContextMutations[P]>
            : ContextMutations[P] extends MutationFactoryProperty
            ? StaticMutationFactoryOutput<[...Key, P], ContextMutations[P]>
            : never;
        };
      };

type DynamicQueryFactoryOutput<
  Keys extends AnyMutableOrReadonlyArray,
  Generator extends QueryDynamicKey,
  Output extends ReturnType<Generator> = ReturnType<Generator>,
> = {
  (...args: Parameters<Generator>): Output extends [...infer TupleResult] | readonly [...infer TupleResult]
    ? Omit<QueryOptions<[...Keys, ...TupleResult], QueryFunction>, 'queryFn'>
    : Output extends DynamicQueryFactoryWithContextualQueriesSchema
    ? Omit<FactoryQueryOptionsWithContextualQueriesOutput<Keys, Output>, '_def'>
    : Output extends DynamicQueryFactorySchema
    ? Omit<FactoryQueryOptionsOutput<Keys, Output>, '_def'>
    : Output extends DynamicQueryKeySchemaWithContextualQueries
    ? Omit<QueryFactoryWithContextualQueriesOutput<Keys, Output>, '_def'>
    : Output extends QueryKeyRecord
    ? Omit<FactoryQueryKeyRecordOutput<Keys, Output>, '_def'>
    : never;
} & DefinitionKey<Keys>;

type DynamicMutationFactoryOutput<
  Keys extends AnyMutableOrReadonlyArray,
  Generator extends MutationDynamicKey,
  Output extends ReturnType<Generator> = ReturnType<Generator>,
> = {
  (...args: Parameters<Generator>): Output extends [...infer TupleResult] | readonly [...infer TupleResult]
    ? Omit<MutationOptions<[...Keys, ...TupleResult], MutateFunction>, 'mutationFn'>
    : Output extends DynamicMutationFactoryWithContextualMutationsSchema
    ? Omit<FactoryMutationOptionsWithContextualQueriesOutput<Keys, Output>, '_def'>
    : Output extends DynamicMutationFactorySchema
    ? Omit<FactoryMutationOptionsOutput<Keys, Output>, '_def'>
    : Output extends DynamicMutationKeySchemaWithContextualMutations
    ? Omit<MutationFactoryWithContextualQueriesOutput<Keys, Output>, '_def'>
    : Output extends MutationKeyRecord
    ? Omit<FactoryMutationKeyRecordOutput<Keys, Output>, '_def'>
    : never;
} & DefinitionKey<Keys>;

export type AnyQueryFactoryOutputCallback = DynamicQueryFactoryOutput<[string, ...any[]], QueryDynamicKey>;
export type AnyMutationFactoryOutputCallback = DynamicMutationFactoryOutput<[string, ...any[]], MutationDynamicKey>;

type StaticQueryFactoryOutput<
  Keys extends AnyMutableOrReadonlyArray,
  Property extends QueryFactoryProperty,
> = Property extends null
  ? Omit<QueryOptions<Keys, QueryFunction>, 'queryFn'>
  : Property extends [...infer Result] | readonly [...infer Result]
  ? DefinitionKey<Keys> & Omit<QueryOptions<[...Keys, ...Result], QueryFunction>, 'queryFn'>
  : Property extends QueryFactoryWithContextualQueriesSchema
  ? FactoryQueryOptionsWithContextualQueriesOutput<Keys, Property>
  : Property extends $QueryFactorySchema
  ? FactoryQueryOptionsOutput<Keys, Property>
  : Property extends QueryKeySchemaWithContextualQueries
  ? QueryFactoryWithContextualQueriesOutput<Keys, Property>
  : Property extends NullableQueryKeyRecord
  ? FactoryQueryKeyRecordOutput<Keys, Property>
  : never;

type StaticMutationFactoryOutput<
  Keys extends AnyMutableOrReadonlyArray,
  Property extends MutationFactoryProperty,
> = Property extends null
  ? Omit<MutationOptions<Keys, MutateFunction>, 'mutationFn'>
  : Property extends [...infer Result] | readonly [...infer Result]
  ? DefinitionKey<Keys> & Omit<MutationOptions<[...Keys, ...Result], MutateFunction>, 'mutationFn'>
  : Property extends MutationFactoryWithContextualMutationsSchema
  ? FactoryMutationOptionsWithContextualQueriesOutput<Keys, Property>
  : Property extends $MutationFactorySchema
  ? FactoryMutationOptionsOutput<Keys, Property>
  : Property extends MutationKeySchemaWithContextualMutations
  ? MutationFactoryWithContextualQueriesOutput<Keys, Property>
  : Property extends NullableMutationKeyRecord
  ? FactoryMutationKeyRecordOutput<Keys, Property>
  : never;

type QueryFactoryOutput<Key extends string, Schema extends QueryFactorySchema> = DefinitionKey<[Key]> & {
  [P in keyof Schema]: Schema[P] extends QueryDynamicKey
    ? DynamicQueryFactoryOutput<[Key, P], Schema[P]>
    : Schema[P] extends QueryFactoryProperty
    ? StaticQueryFactoryOutput<[Key, P], Schema[P]>
    : never;
};

type MutationFactoryOutput<Key extends string, Schema extends MutationFactorySchema> = DefinitionKey<[Key]> & {
  [P in keyof Schema]: Schema[P] extends MutationDynamicKey
    ? DynamicMutationFactoryOutput<[Key, P], Schema[P]>
    : Schema[P] extends MutationFactoryProperty
    ? StaticMutationFactoryOutput<[Key, P], Schema[P]>
    : never;
};

export type DefinitionKey<Key extends AnyMutableOrReadonlyArray> = {
  _def: readonly [...Key];
};

export type QueryKeyFactoryResult<Key extends string, Schema extends QueryFactorySchema> = QueryFactoryOutput<
  Key,
  Schema
>;

export type MutationKeyFactoryResult<Key extends string, Schema extends MutationFactorySchema> = MutationFactoryOutput<
  Key,
  Schema
>;

export type AnyQueryKeyFactoryResult = DefinitionKey<[string]> | QueryKeyFactoryResult<string, any>;
export type AnyMutationKeyFactoryResult = DefinitionKey<[string]> | MutationKeyFactoryResult<string, any>;

type inferRecordQueryKeys<Target extends object> = {
  [P in Exclude<keyof Target, 'queryFn'>]: Target[P] extends AnyMutableOrReadonlyArray
    ? Target[P]
    : Target[P] extends object
    ? {
        [K in keyof Target[P]]: inferSchemaProperty<Target[P][K]>;
      }
    : never;
};

type inferRecordMutationKeys<Target extends object> = {
  [P in Exclude<keyof Target, 'mutationFn'>]: Target[P] extends AnyMutableOrReadonlyArray
    ? Target[P]
    : Target[P] extends object
    ? {
        [K in keyof Target[P]]: inferSchemaProperty<Target[P][K]>;
      }
    : never;
};

type inferSchemaProperty<Value> = Value extends AnyMutableOrReadonlyArray
  ? Value
  : Value extends StaticQueryFactoryOutput<any[], any>
  ? inferRecordQueryKeys<Value>
  : Value extends StaticMutationFactoryOutput<any[], any>
  ? inferRecordMutationKeys<Value>
  : Value extends AnyQueryFactoryOutputCallback
  ? Record<'_def', Value['_def']> & inferRecordQueryKeys<ReturnType<Value>>
  : Value extends AnyMutationFactoryOutputCallback
  ? Record<'_def', Value['_def']> & inferRecordMutationKeys<ReturnType<Value>>
  : never;

export type inferQueryKeys<Schema extends AnyQueryKeyFactoryResult | AnyMutationKeyFactoryResult> = {
  [P in keyof Schema]: MergeInsertions<inferSchemaProperty<Schema[P]>>;
};

export type StoreFromMergedQueryKeys<
  QueryOrMutationKeyFactoryResults extends Array<AnyQueryKeyFactoryResult | AnyMutationKeyFactoryResult>,
  CurrentIndex extends number = 0,
> = QueryOrMutationKeyFactoryResults[CurrentIndex] extends null | undefined
  ? {}
  : {
      [P in QueryOrMutationKeyFactoryResults[CurrentIndex]['_def'][0]]: QueryOrMutationKeyFactoryResults[CurrentIndex];
    } & StoreFromMergedQueryKeys<QueryOrMutationKeyFactoryResults, Add<CurrentIndex, 1>>;

export type QueryKeyStoreSchema = Record<string, null | QueryFactorySchema>;

export type QueryKeyStore<StoreSchema extends QueryKeyStoreSchema> = {
  [P in keyof StoreSchema & string]: StoreSchema[P] extends QueryFactorySchema
    ? QueryKeyFactoryResult<P, StoreSchema[P]>
    : DefinitionKey<[P]>;
};

export type inferQueryKeyStore<Store extends QueryKeyStore<any>> = {
  [P in keyof Store]: inferQueryKeys<Store[P]>;
};
