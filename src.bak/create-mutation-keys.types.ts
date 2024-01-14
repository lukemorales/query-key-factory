import type { MutateFunction } from '@tanstack/query-core';

import type { ExtractInternalKeys, InternalKey } from './internals';
import type { KeyTuple, AnyMutableOrReadonlyArray, DefinitionKey } from './types';

export type AnyMutationKey = readonly [string, ...any[]];

type NullableMutationKeyRecord = Record<'mutationKey', KeyTuple | null>;

type MutationKeyRecord = Record<'mutationKey', KeyTuple>;

type MutationKeySchemaWithContextualMutations = NullableMutationKeyRecord & {
  contextMutations: MutationFactorySchema;
};

type $MutationFactorySchema = NullableMutationKeyRecord & {
  mutationFn: MutateFunction;
};

type MutationFactoryWithContextualMutationsSchema = NullableMutationKeyRecord & {
  mutationFn: MutateFunction;
  contextMutations: MutationFactorySchema;
};

type DynamicMutationKeySchemaWithContextualMutations = MutationKeyRecord & {
  contextMutations: MutationFactorySchema;
};

type DynamicMutationFactorySchema = MutationKeyRecord & {
  mutationFn: MutateFunction;
};

type DynamicMutationFactoryWithContextualMutationsSchema = MutationKeyRecord & {
  mutationFn: MutateFunction;
  contextMutations: MutationFactorySchema;
};

type MutationFactoryProperty =
  | null
  | KeyTuple
  | NullableMutationKeyRecord
  | MutationKeySchemaWithContextualMutations
  | $MutationFactorySchema
  | MutationFactoryWithContextualMutationsSchema;

type MutationDynamicKey = (
  ...args: any[]
) =>
  | DynamicMutationFactoryWithContextualMutationsSchema
  | DynamicMutationFactorySchema
  | DynamicMutationKeySchemaWithContextualMutations
  | MutationKeyRecord
  | KeyTuple;

export type MutationFactorySchema = Record<string, MutationFactoryProperty | MutationDynamicKey>;

type InvalidSchema<Schema extends MutationFactorySchema> = Omit<Schema, InternalKey>;

export type ValidateFactory<Schema extends MutationFactorySchema> = Schema extends {
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

export type MutationOptionsStruct<
  Keys extends AnyMutableOrReadonlyArray,
  Fetcher extends MutateFunction,
  FetcherResult extends ReturnType<Fetcher> = ReturnType<Fetcher>,
  FetcherVariables extends Parameters<Fetcher>[0] = Parameters<Fetcher>[0],
> = {
  mutationKey: readonly [...Keys];
  mutationFn: MutateFunction<Awaited<FetcherResult>, unknown, FetcherVariables>;
};

type MutationFactoryWithContextualQueriesOutput<
  BaseKey extends AnyMutableOrReadonlyArray,
  Schema extends MutationKeySchemaWithContextualMutations | DynamicMutationKeySchemaWithContextualMutations,
  SchemaMutationKey extends Schema['mutationKey'] = Schema['mutationKey'],
  ContextMutations extends Schema['contextMutations'] = Schema['contextMutations'],
  ComposedKey extends AnyMutableOrReadonlyArray = ComposeQueryKey<BaseKey, ExtractNullableKey<SchemaMutationKey>>,
> = SchemaMutationKey extends null
  ? Omit<MutationOptionsStruct<ComposedKey, MutateFunction>, 'mutationFn'> & {
      _ctx: {
        [P in keyof ContextMutations]: ContextMutations[P] extends MutationDynamicKey
          ? DynamicMutationFactoryOutput<[...ComposedKey, P], ContextMutations[P]>
          : ContextMutations[P] extends MutationFactoryProperty
          ? StaticMutationFactoryOutput<[...ComposedKey, P], ContextMutations[P]>
          : never;
      };
    }
  : Omit<MutationOptionsStruct<ComposedKey, MutateFunction>, 'mutationFn'> &
      DefinitionKey<BaseKey> & {
        _ctx: {
          [P in keyof ContextMutations]: ContextMutations[P] extends MutationDynamicKey
            ? DynamicMutationFactoryOutput<[...ComposedKey, P], ContextMutations[P]>
            : ContextMutations[P] extends MutationFactoryProperty
            ? StaticMutationFactoryOutput<[...ComposedKey, P], ContextMutations[P]>
            : never;
        };
      };

type FactoryMutationKeyRecordOutput<
  BaseKey extends AnyMutableOrReadonlyArray,
  Schema extends NullableMutationKeyRecord | MutationKeyRecord,
  SchemaMutationKey extends Schema['mutationKey'] = Schema['mutationKey'],
  ComposedKey extends AnyMutableOrReadonlyArray = ComposeQueryKey<BaseKey, ExtractNullableKey<SchemaMutationKey>>,
> = SchemaMutationKey extends null
  ? Omit<MutationOptionsStruct<BaseKey, MutateFunction>, 'mutationFn'>
  : Omit<MutationOptionsStruct<ComposedKey, MutateFunction>, 'mutationFn'> & DefinitionKey<BaseKey>;

type FactoryMutationOptionsOutput<
  BaseKey extends AnyMutableOrReadonlyArray,
  Schema extends $MutationFactorySchema | DynamicMutationFactorySchema,
  SchemaQueryKey extends Schema['mutationKey'] = Schema['mutationKey'],
  MutationFn extends Schema['mutationFn'] = Schema['mutationFn'],
  ComposedKey extends AnyMutableOrReadonlyArray = ComposeQueryKey<BaseKey, ExtractNullableKey<SchemaQueryKey>>,
> = SchemaQueryKey extends null
  ? MutationOptionsStruct<BaseKey, MutationFn>
  : MutationOptionsStruct<ComposedKey, MutationFn> & DefinitionKey<BaseKey>;

type FactoryMutationOptionsWithContextualQueriesOutput<
  BaseKey extends AnyMutableOrReadonlyArray,
  Schema extends MutationFactoryWithContextualMutationsSchema | DynamicMutationFactoryWithContextualMutationsSchema,
  SchemaQueryKey extends Schema['mutationKey'] = Schema['mutationKey'],
  MutationFn extends Schema['mutationFn'] = Schema['mutationFn'],
  ContextMutations extends Schema['contextMutations'] = Schema['contextMutations'],
  Key extends AnyMutableOrReadonlyArray = ComposeQueryKey<BaseKey, ExtractNullableKey<SchemaQueryKey>>,
> = SchemaQueryKey extends null
  ? MutationOptionsStruct<Key, MutationFn> & {
      _ctx: {
        [P in keyof ContextMutations]: ContextMutations[P] extends MutationDynamicKey
          ? DynamicMutationFactoryOutput<[...Key, P], ContextMutations[P]>
          : ContextMutations[P] extends MutationFactoryProperty
          ? StaticMutationFactoryOutput<[...Key, P], ContextMutations[P]>
          : never;
      };
    }
  : DefinitionKey<BaseKey> &
      MutationOptionsStruct<Key, MutationFn> & {
        _ctx: {
          [P in keyof ContextMutations]: ContextMutations[P] extends MutationDynamicKey
            ? DynamicMutationFactoryOutput<[...Key, P], ContextMutations[P]>
            : ContextMutations[P] extends MutationFactoryProperty
            ? StaticMutationFactoryOutput<[...Key, P], ContextMutations[P]>
            : never;
        };
      };

type DynamicMutationFactoryOutput<
  Keys extends AnyMutableOrReadonlyArray,
  Generator extends MutationDynamicKey,
  Output extends ReturnType<Generator> = ReturnType<Generator>,
> = ((
  ...args: Parameters<Generator>
) => Output extends [...infer TupleResult] | readonly [...infer TupleResult]
  ? Omit<MutationOptionsStruct<[...Keys, ...TupleResult], MutateFunction>, 'mutationFn'>
  : Output extends DynamicMutationFactoryWithContextualMutationsSchema
  ? Omit<FactoryMutationOptionsWithContextualQueriesOutput<Keys, Output>, '_def'>
  : Output extends DynamicMutationFactorySchema
  ? Omit<FactoryMutationOptionsOutput<Keys, Output>, '_def'>
  : Output extends DynamicMutationKeySchemaWithContextualMutations
  ? Omit<MutationFactoryWithContextualQueriesOutput<Keys, Output>, '_def'>
  : Output extends MutationKeyRecord
  ? Omit<FactoryMutationKeyRecordOutput<Keys, Output>, '_def'>
  : never) &
  DefinitionKey<Keys>;

export type AnyMutationFactoryOutputCallback = DynamicMutationFactoryOutput<[string, ...any[]], MutationDynamicKey>;

export type StaticMutationFactoryOutput<
  Keys extends AnyMutableOrReadonlyArray,
  Property extends MutationFactoryProperty,
> = Property extends null
  ? Omit<MutationOptionsStruct<Keys, MutateFunction>, 'mutationFn'>
  : Property extends [...infer Result] | readonly [...infer Result]
  ? DefinitionKey<Keys> & Omit<MutationOptionsStruct<[...Keys, ...Result], MutateFunction>, 'mutationFn'>
  : Property extends MutationFactoryWithContextualMutationsSchema
  ? FactoryMutationOptionsWithContextualQueriesOutput<Keys, Property>
  : Property extends $MutationFactorySchema
  ? FactoryMutationOptionsOutput<Keys, Property>
  : Property extends MutationKeySchemaWithContextualMutations
  ? MutationFactoryWithContextualQueriesOutput<Keys, Property>
  : Property extends NullableMutationKeyRecord
  ? FactoryMutationKeyRecordOutput<Keys, Property>
  : never;

type MutationFactoryOutput<Key extends string, Schema extends MutationFactorySchema> = DefinitionKey<[Key]> & {
  [P in keyof Schema]: Schema[P] extends MutationDynamicKey
    ? DynamicMutationFactoryOutput<[Key, P], Schema[P]>
    : Schema[P] extends MutationFactoryProperty
    ? StaticMutationFactoryOutput<[Key, P], Schema[P]>
    : never;
};

export type MutationKeyFactoryResult<Key extends string, Schema extends MutationFactorySchema> = MutationFactoryOutput<
  Key,
  Schema
>;

export type AnyMutationKeyFactoryResult = DefinitionKey<[string]> | MutationKeyFactoryResult<string, any>;
