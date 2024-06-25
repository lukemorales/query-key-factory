import type { QueryFunction } from '@tanstack/query-core';

import type { ExtractInternalKeys, InternalKey } from './internals';
import type { KeyTuple, AnyMutableOrReadonlyArray, DefinitionKey } from './types';

export type AnyQueryKey = readonly [string, ...any[]];

type NullableQueryKeyRecord = Record<'queryKey', KeyTuple | null>;

type QueryKeyRecord = Record<'queryKey', KeyTuple>;

type KeySchemaWithContextualQueries = NullableQueryKeyRecord & {
  contextQueries: QueryFactorySchema;
};

type $QueryFactorySchema = NullableQueryKeyRecord & {
  queryFn: QueryFunction;
};

type QueryFactoryWithContextualQueriesSchema = NullableQueryKeyRecord & {
  queryFn: QueryFunction;
  contextQueries: QueryFactorySchema;
};

type DynamicKeySchemaWithContextualQueries = QueryKeyRecord & {
  contextQueries: QueryFactorySchema;
};

type DynamicQueryFactorySchema = QueryKeyRecord & {
  queryFn: QueryFunction;
};

type DynamicQueryFactoryWithContextualQueriesSchema = QueryKeyRecord & {
  queryFn: QueryFunction;
  contextQueries: QueryFactorySchema;
};

type FactoryProperty =
  | null
  | KeyTuple
  | NullableQueryKeyRecord
  | KeySchemaWithContextualQueries
  | $QueryFactorySchema
  | QueryFactoryWithContextualQueriesSchema;

type DynamicKey = (
  ...args: any[]
) =>
  | DynamicQueryFactoryWithContextualQueriesSchema
  | DynamicQueryFactorySchema
  | DynamicKeySchemaWithContextualQueries
  | QueryKeyRecord
  | KeyTuple;

export type QueryFactorySchema = Record<string, FactoryProperty | DynamicKey>;

type InvalidSchema<Schema extends QueryFactorySchema> = Omit<Schema, InternalKey>;

export type ValidateFactory<Schema extends QueryFactorySchema> = Schema extends {
  [P in ExtractInternalKeys<Schema>]: Schema[P];
}
  ? InvalidSchema<Schema>
  : {
      [P in keyof Schema]: Schema[P];
    };

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

export type QueryOptionsStruct<
  Keys extends AnyMutableOrReadonlyArray,
  Fetcher extends QueryFunction,
  FetcherResult extends ReturnType<Fetcher> = ReturnType<Fetcher>,
> = {
  queryKey: readonly [...Keys];
  queryFn: QueryFunction<Awaited<FetcherResult>, readonly [...Keys]>;
};

type FactoryWithContextualQueriesOutput<
  BaseKey extends AnyMutableOrReadonlyArray,
  Schema extends KeySchemaWithContextualQueries | DynamicKeySchemaWithContextualQueries,
  SchemaQueryKey extends Schema['queryKey'] = Schema['queryKey'],
  ContextQueries extends Schema['contextQueries'] = Schema['contextQueries'],
  ComposedKey extends AnyMutableOrReadonlyArray = ComposeQueryKey<BaseKey, ExtractNullableKey<SchemaQueryKey>>,
> = SchemaQueryKey extends null
  ? Omit<QueryOptionsStruct<ComposedKey, QueryFunction>, 'queryFn'> & {
      _ctx: {
        [P in keyof ContextQueries]: ContextQueries[P] extends DynamicKey
          ? DynamicFactoryOutput<[...ComposedKey, P], ContextQueries[P]>
          : ContextQueries[P] extends FactoryProperty
          ? StaticFactoryOutput<[...ComposedKey, P], ContextQueries[P]>
          : never;
      };
    }
  : Omit<QueryOptionsStruct<ComposedKey, QueryFunction>, 'queryFn'> &
      DefinitionKey<BaseKey> & {
        _ctx: {
          [P in keyof ContextQueries]: ContextQueries[P] extends DynamicKey
            ? DynamicFactoryOutput<[...ComposedKey, P], ContextQueries[P]>
            : ContextQueries[P] extends FactoryProperty
            ? StaticFactoryOutput<[...ComposedKey, P], ContextQueries[P]>
            : never;
        };
      };

type FactoryQueryKeyRecordOutput<
  BaseKey extends AnyMutableOrReadonlyArray,
  Schema extends NullableQueryKeyRecord | QueryKeyRecord,
  SchemaQueryKey extends Schema['queryKey'] = Schema['queryKey'],
  ComposedKey extends AnyMutableOrReadonlyArray = ComposeQueryKey<BaseKey, ExtractNullableKey<SchemaQueryKey>>,
> = SchemaQueryKey extends null
  ? Omit<QueryOptionsStruct<BaseKey, QueryFunction>, 'queryFn'>
  : Omit<QueryOptionsStruct<ComposedKey, QueryFunction>, 'queryFn'> & DefinitionKey<BaseKey>;

type FactoryQueryOptionsOutput<
  BaseKey extends AnyMutableOrReadonlyArray,
  Schema extends $QueryFactorySchema | DynamicQueryFactorySchema,
  SchemaQueryKey extends Schema['queryKey'] = Schema['queryKey'],
  QueryFn extends Schema['queryFn'] = Schema['queryFn'],
  ComposedKey extends AnyMutableOrReadonlyArray = ComposeQueryKey<BaseKey, ExtractNullableKey<SchemaQueryKey>>,
> = SchemaQueryKey extends null
  ? QueryOptionsStruct<BaseKey, QueryFn>
  : QueryOptionsStruct<ComposedKey, QueryFn> & DefinitionKey<BaseKey>;

type FactoryQueryOptionsWithContextualQueriesOutput<
  BaseKey extends AnyMutableOrReadonlyArray,
  Schema extends QueryFactoryWithContextualQueriesSchema | DynamicQueryFactoryWithContextualQueriesSchema,
  SchemaQueryKey extends Schema['queryKey'] = Schema['queryKey'],
  QueryFn extends Schema['queryFn'] = Schema['queryFn'],
  ContextQueries extends Schema['contextQueries'] = Schema['contextQueries'],
  Key extends AnyMutableOrReadonlyArray = ComposeQueryKey<BaseKey, ExtractNullableKey<SchemaQueryKey>>,
> = SchemaQueryKey extends null
  ? QueryOptionsStruct<Key, QueryFn> & {
      _ctx: {
        [P in keyof ContextQueries]: ContextQueries[P] extends DynamicKey
          ? DynamicFactoryOutput<[...Key, P], ContextQueries[P]>
          : ContextQueries[P] extends FactoryProperty
          ? StaticFactoryOutput<[...Key, P], ContextQueries[P]>
          : never;
      };
    }
  : DefinitionKey<BaseKey> &
      QueryOptionsStruct<Key, QueryFn> & {
        _ctx: {
          [P in keyof ContextQueries]: ContextQueries[P] extends DynamicKey
            ? DynamicFactoryOutput<[...Key, P], ContextQueries[P]>
            : ContextQueries[P] extends FactoryProperty
            ? StaticFactoryOutput<[...Key, P], ContextQueries[P]>
            : never;
        };
      };

type DynamicFactoryOutput<
  Keys extends AnyMutableOrReadonlyArray,
  Generator extends DynamicKey,
  Output extends ReturnType<Generator> = ReturnType<Generator>,
> = ((
  ...args: Parameters<Generator>
) => Output extends [...infer TupleResult] | readonly [...infer TupleResult]
  ? Omit<QueryOptionsStruct<[...Keys, ...TupleResult], QueryFunction>, 'queryFn'>
  : Output extends DynamicQueryFactoryWithContextualQueriesSchema
  ? Omit<FactoryQueryOptionsWithContextualQueriesOutput<Keys, Output>, '_def'>
  : Output extends DynamicQueryFactorySchema
  ? Omit<FactoryQueryOptionsOutput<Keys, Output>, '_def'>
  : Output extends DynamicKeySchemaWithContextualQueries
  ? Omit<FactoryWithContextualQueriesOutput<Keys, Output>, '_def'>
  : Output extends QueryKeyRecord
  ? Omit<FactoryQueryKeyRecordOutput<Keys, Output>, '_def'>
  : never) &
  DefinitionKey<Keys>;

export type AnyQueryFactoryOutputCallback = DynamicFactoryOutput<[string, ...any[]], DynamicKey>;

export type StaticFactoryOutput<
  Keys extends AnyMutableOrReadonlyArray,
  Property extends FactoryProperty,
> = Property extends null
  ? Omit<QueryOptionsStruct<Keys, QueryFunction>, 'queryFn'>
  : Property extends [...infer Result] | readonly [...infer Result]
  ? DefinitionKey<Keys> & Omit<QueryOptionsStruct<[...Keys, ...Result], QueryFunction>, 'queryFn'>
  : Property extends QueryFactoryWithContextualQueriesSchema
  ? FactoryQueryOptionsWithContextualQueriesOutput<Keys, Property>
  : Property extends $QueryFactorySchema
  ? FactoryQueryOptionsOutput<Keys, Property>
  : Property extends KeySchemaWithContextualQueries
  ? FactoryWithContextualQueriesOutput<Keys, Property>
  : Property extends NullableQueryKeyRecord
  ? FactoryQueryKeyRecordOutput<Keys, Property>
  : never;

type FactoryOutput<Key extends string, Schema extends QueryFactorySchema> = DefinitionKey<[Key]> & {
  [P in keyof Schema]: Schema[P] extends DynamicKey
    ? DynamicFactoryOutput<[Key, P], Schema[P]>
    : Schema[P] extends FactoryProperty
    ? StaticFactoryOutput<[Key, P], Schema[P]>
    : never;
};

export type QueryKeyFactoryResult<Key extends string, Schema extends QueryFactorySchema> = FactoryOutput<Key, Schema>;

export type AnyQueryKeyFactoryResult = DefinitionKey<[string]> | QueryKeyFactoryResult<string, any>;
