import {
  createInfiniteQueryOptions,
  type InfiniteQueryOptionsWithoutInitialDataResult,
} from './create-infinite-query-options';
import { createMutationOptions, type MutationOptionsResult } from './create-mutation-options';
import { type createQueryOptions, type QueryOptionsWithoutInitialDataResult } from './create-query-options';
import { type Prettify } from './internals';
import { type AnyTuple, type EmptyKey, type FactoryOptions, type WorkableKey } from './primitives';

type AnyQueryOption = FactoryOptions<Record<string, any>>;

type DynamicQueryOption = (...args: any[]) => AnyQueryOption;

type QueryDefField = AnyQueryOption | DynamicQueryOption;

type MutationDefField = FactoryOptions<Record<string, any>>;

type QueryObject<T extends AnyTuple, Extendable = unknown> = Prettify<{ $query: Readonly<T> } & Extendable>;

type MutationObject<T extends AnyTuple, Extendable = unknown> = Prettify<{ $mutation: Readonly<T> } & Extendable>;

type DefaultQueryKeySchema<Key> = {
  $def: { queryKey: readonly [{ $query: readonly [Key] }] };
};

type MakeQueryKey<Feature extends AnyTuple, QueryKey extends WorkableKey = EmptyKey> =
  QueryKey extends [infer Data] ? readonly [QueryObject<Feature, Data>]
  : QueryKey extends EmptyKey ? readonly [QueryObject<Feature>]
  : never;

type MakeMutationKey<Feature extends AnyTuple, QueryKey extends WorkableKey = EmptyKey> =
  QueryKey extends [infer Data] ? readonly [MutationObject<Feature, Data>]
  : QueryKey extends EmptyKey ? readonly [MutationObject<Feature>]
  : never;

type SchemaQueryOptions<Feature extends string, FieldName extends string, Field extends QueryDefField> =
  Field extends (
    (...args: any[]) => QueryOptionsWithoutInitialDataResult<infer Data, infer SelectedData, infer QueryKey>
  ) ?
    (
      ...args: Parameters<Field>
    ) => QueryOptionsWithoutInitialDataResult<Data, SelectedData, MakeQueryKey<[Feature, FieldName], QueryKey>>
  : Field extends QueryOptionsWithoutInitialDataResult<infer Data, infer SelectedData, infer QueryKey> ?
    () => QueryOptionsWithoutInitialDataResult<Data, SelectedData, MakeQueryKey<[Feature, FieldName], QueryKey>>
  : never;

type SchemaMutationOptions<Feature extends string, FieldName extends string, Field extends MutationDefField> =
  Field extends MutationOptionsResult<infer Data, infer SelectedData, infer Context> ?
    () => MutationOptionsResult<Data, SelectedData, Context> & { mutationKey: MakeMutationKey<[Feature, FieldName]> }
  : never;

type SchemaInfiniteQueryOptions<Entity extends string, FieldName extends string, Field extends QueryDefField> =
  Field extends (
    (...args: any[]) => InfiniteQueryOptionsWithoutInitialDataResult<infer Data, infer SelectedData, infer QueryKey>
  ) ?
    (
      ...args: Parameters<Field>
    ) => InfiniteQueryOptionsWithoutInitialDataResult<Data, SelectedData, MakeQueryKey<[Entity, FieldName], QueryKey>>
  : Field extends InfiniteQueryOptionsWithoutInitialDataResult<infer Data, infer SelectedData, infer QueryKey> ?
    () => InfiniteQueryOptionsWithoutInitialDataResult<Data, SelectedData, MakeQueryKey<[Entity, FieldName], QueryKey>>
  : never;

class QueryBuilder<Feature extends string, Schema extends Record<string, any> = DefaultQueryKeySchema<Feature>> {
  private schema: Schema;

  constructor(private readonly feature: Feature) {
    const initialSchema: DefaultQueryKeySchema<Feature> = {
      $def: { queryKey: [{ $query: [this.feature] }] },
    };

    this.schema = initialSchema as any;
  }

  query<Operation extends string, QueryOptions extends AnyQueryOption | DynamicQueryOption>(
    operation: Exclude<Operation, keyof Schema> extends never ? `Operation "${Operation}" is already declared`
    : Operation,
    builder: (options: { queryOptions: createQueryOptions }) => QueryOptions,
  ): QueryBuilder<
    Feature,
    Prettify<Schema & { [Op in Operation]: SchemaQueryOptions<Feature, Operation, QueryOptions> }>
  > {
    type $Query = [string, string];
    const $query: $Query = [this.feature, operation];

    let options = builder({ queryOptions: makeQueryOptions });

    if (typeof options === 'function') {
      const createQueryOptions = options as DynamicQueryOption;

      const monkeyPatchedQueryOptions = (...args: [any, ...any[]]) => {
        type $QueryKey = [Record<string, unknown>];

        const innerOptions = createQueryOptions(...args);
        const [record] = innerOptions.queryKey as $QueryKey;

        const monkeyPatchedQueryKey: MakeQueryKey<$Query, $QueryKey> = [{ $query, ...record }];
        innerOptions.queryKey = monkeyPatchedQueryKey;

        return innerOptions;
      };

      options = monkeyPatchedQueryOptions as any;

      (this.schema as any)[operation] = options;
    } else {
      const queryKey: MakeQueryKey<$Query> = [{ $query }];
      options.queryKey = queryKey;

      (this.schema as any)[operation] = () => options;
    }

    return this as any;
  }

  mutation<Operation extends string, MutationOptions extends MutationDefField>(
    operation: Exclude<Operation, keyof Schema> extends never ? `Operation "${Operation}" is already declared`
    : Operation,
    builder: (options: { mutationOptions: createMutationOptions }) => MutationOptions,
  ): QueryBuilder<
    Feature,
    Prettify<Schema & { [Op in Operation]: SchemaMutationOptions<Feature, Operation, MutationOptions> }>
  > {
    type $Mutation = [string, string];
    const $mutation: $Mutation = [this.feature, operation];

    const options = builder({ mutationOptions: createMutationOptions });

    const monkeyPatchedMutationKey: MakeMutationKey<$Mutation> = [{ $mutation }];

    (this.schema as any)[operation] = () => ({
      ...options,
      mutationKey: monkeyPatchedMutationKey,
    });

    return this as any;
  }

  infiniteQuery<Operation extends string, QueryOptions extends QueryDefField>(
    operation: Exclude<Operation, keyof Schema> extends never ? `Operation "${Operation}" is already declared`
    : Operation,
    builder: (options: { infiniteQueryOptions: createInfiniteQueryOptions }) => QueryOptions,
  ): QueryBuilder<
    Feature,
    Prettify<Schema & { [Op in Operation]: SchemaInfiniteQueryOptions<Feature, Operation, QueryOptions> }>
  > {
    const options = builder({ infiniteQueryOptions: createInfiniteQueryOptions });

    (this.schema as any)[operation] = () => options;

    return this as any;
  }

  build(): Schema {
    return this.schema;
  }
}

export function buildQueriesFor<T extends string>(entity: T) {
  return new QueryBuilder(entity);
}
