import {
  createInfiniteQueryOptions,
  type InfiniteQueryOptionsWithoutInitialDataResult,
} from './create-infinite-query-options';
import { type MutationOptions, type MutationOptionsResult } from './create-mutation-options';
import {
  type Options,
  type OptionsWithInitialData,
  type QueryOptionsWithInitialDataResult,
  type QueryOptionsWithoutInitialDataResult,
} from './create-query-options';
import { type Prettify } from './internals';
import { type AnyTuple, type EmptyKey, type FactoryOptions, type RecordTuple, type WorkableKey } from './primitives';

type AnyQueryOption = FactoryOptions<Record<string, any>>;

type DynamicQueryOption = (...args: any[]) => AnyQueryOption;

type QueryDefField = AnyQueryOption | DynamicQueryOption;

type MutationDefField = FactoryOptions<Record<string, any>>;

type QueryObject<T extends AnyTuple, Extendable = unknown> = Prettify<{ $query: Readonly<T> } & Extendable>;

type MutationObject<T extends AnyTuple, Extendable = unknown> = Prettify<{ $mutation: Readonly<T> } & Extendable>;

type DefaultQueryKeySchema<Key> = {
  $feature: { queryKey: readonly [{ $query: readonly [Key] }] };
};

type MakeQueryKey<Feature extends AnyTuple, QueryKey extends WorkableKey = EmptyKey> =
  QueryKey extends [infer Data] | readonly [infer Data] ? readonly [QueryObject<Feature, Data>]
  : QueryKey extends EmptyKey ? readonly [QueryObject<Feature>]
  : never;

type MakeMutationKey<Feature extends AnyTuple, QueryKey extends WorkableKey = EmptyKey> =
  QueryKey extends [infer Data] | readonly [infer Data] ? readonly [MutationObject<Feature, Data>]
  : QueryKey extends EmptyKey ? readonly [MutationObject<Feature>]
  : never;

type SchemaQueryOptions<Entity extends string, FieldName extends string, Field extends QueryDefField> =
  Field extends (
    (...args: any[]) => QueryOptionsWithoutInitialDataResult<infer Data, infer SelectedData, infer QueryKey>
  ) ?
    (
      ...args: Parameters<Field>
    ) => QueryOptionsWithoutInitialDataResult<Data, SelectedData, MakeQueryKey<[Entity, FieldName], QueryKey>>
  : Field extends QueryOptionsWithoutInitialDataResult<infer Data, infer SelectedData, infer QueryKey> ?
    () => QueryOptionsWithoutInitialDataResult<Data, SelectedData, MakeQueryKey<[Entity, FieldName], QueryKey>>
  : never;

type SchemaMutationOptions<Entity extends string, FieldName extends string, Field extends MutationDefField> =
  Field extends MutationOptionsResult<infer Data, infer SelectedData, infer Context> ?
    () => MutationOptionsResult<Data, SelectedData, Context> & { mutationKey: MakeMutationKey<[Entity, FieldName]> }
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

class QueryBuilder<Entity extends string, Schema extends Record<string, any> = DefaultQueryKeySchema<Entity>> {
  protected schema: Schema;

  constructor(private readonly feature: Entity) {
    const initialSchema: DefaultQueryKeySchema<Entity> = {
      $feature: { queryKey: [{ $query: [this.feature] }] },
    };

    this.schema = initialSchema as any;
  }

  query<Operation extends string, DynamicOptions extends (...args: any[]) => AnyQueryOption>(
    operation: Exclude<Operation, keyof Schema> extends never ? `Operation "${Operation}" is already declared`
    : Operation,
    dynamicOptions: DynamicOptions,
  ): QueryBuilder<
    Entity,
    Prettify<
      Schema & {
        [Op in Operation]: SchemaQueryOptions<Entity, Operation, DynamicOptions>;
      }
    >
  >;

  query<Operation extends string, Data = unknown, SelectData = Data, Key extends EmptyKey = EmptyKey>(
    operation: Exclude<Operation, keyof Schema> extends never ? `Operation "${Operation}" is already declared`
    : Operation,
    options: Options<Data, SelectData, Key>,
  ): QueryBuilder<
    Entity,
    Prettify<
      Schema & {
        [Op in Operation]: SchemaQueryOptions<
          Entity,
          Operation,
          QueryOptionsWithoutInitialDataResult<Data, SelectData, Key>
        >;
      }
    >
  >;

  query<Operation extends string, Data = unknown, SelectData = Data, Key extends WorkableKey = EmptyKey>(
    operation: Exclude<Operation, keyof Schema> extends never ? `Operation "${Operation}" is already declared`
    : Operation,
    options: Omit<OptionsWithInitialData<Data, SelectData, Key>, 'queryKey'>,
  ): QueryBuilder<
    Entity,
    Prettify<
      Schema & {
        [Op in Operation]: SchemaQueryOptions<
          Entity,
          Operation,
          QueryOptionsWithInitialDataResult<Data, SelectData, Key>
        >;
      }
    >
  >;

  query(operation: string, options: object | ((...args: any[]) => any)): QueryBuilder<string, {}> {
    type $Query = [feature: string, operation: string];
    const $query: $Query = [this.feature, operation];

    if (typeof options === 'function') {
      const createQueryOptions = options as DynamicQueryOption;

      const monkeyPatchedQueryOptions = (...args: [any, ...any[]]) => {
        const innerOptions = createQueryOptions(...args);
        const [record] = innerOptions.queryKey as RecordTuple;

        const monkeyPatchedQueryKey: MakeQueryKey<$Query, RecordTuple> = [{ $query, ...record }];
        innerOptions.queryKey = monkeyPatchedQueryKey;

        return innerOptions;
      };

      options = monkeyPatchedQueryOptions as any;

      (this.schema as any)[operation] = options;
    } else {
      const queryKey: MakeQueryKey<$Query> = [{ $query }];
      (options as any).queryKey = queryKey;

      (this.schema as any)[operation] = () => options;
    }

    return this as any;
  }

  mutation<Operation extends string, Data = unknown, Variables = void, Context = unknown>(
    operation: Exclude<Operation, keyof Schema> extends never ? `Operation "${Operation}" is already declared`
    : Operation,
    options: MutationOptions<Data, Variables, Context>,
  ): QueryBuilder<
    Entity,
    Prettify<
      Schema & {
        [Op in Operation]: SchemaMutationOptions<Entity, Operation, MutationOptionsResult<Data, Variables, Context>>;
      }
    >
  > {
    type $Mutation = [feature: string, operation: string];
    const $mutation: $Mutation = [this.feature, operation];

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
    Entity,
    Prettify<Schema & { [Op in Operation]: SchemaInfiniteQueryOptions<Entity, Operation, QueryOptions> }>
  > {
    const options = builder({ infiniteQueryOptions: createInfiniteQueryOptions });

    (this.schema as any)[operation] = () => options;

    return this as any;
  }
}

class InnerQueryBuilder<
  Entity extends string,
  Schema extends Record<string, any> = DefaultQueryKeySchema<Entity>,
> extends QueryBuilder<Entity, Schema> {
  build() {
    return this.schema;
  }
}

export function buildQueriesFor<T extends string, R extends QueryBuilder<T, any>>(
  entity: T,
  builder: (queryBuilder: QueryBuilder<T>) => R,
): R extends QueryBuilder<T, infer Schema> ? Schema : never {
  const result = builder(new InnerQueryBuilder(entity)) as unknown as InnerQueryBuilder<T, any>;

  return result.build();
}
