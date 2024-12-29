
import type { InfiniteData } from '@tanstack/query-core';

import type {
  AnyObject,
  AnyTuple,
  EmptyKey,
  OmitQueryKey,
  Prettify,
  RecordTuple,
  WorkableKey,
} from './new-types';
import type {
  InfiniteOptionsStruct,
  InfiniteOptionsWithInitialDataStruct,
  InfiniteQueryOptionsWithInitialData,
  InfiniteQueryOptionsWithoutInitialData,
  MutationOptions,
  MutationOptionsStruct,
  OptionsStruct,
  OptionsWithInitialDataStruct,
  QueryOptionsWithInitialData,
  QueryOptionsWithoutInitialData,
} from './options';

type BaseQueryKeyShape = readonly [string, ...any[]];

export type RootQueryBuilderSchema<QueryKey extends AnyTuple> = {
  $root: Readonly<QueryKey>;
};

type MakeKey<
  BaseQueryKey extends AnyTuple,
  Data extends AnyTuple = AnyTuple,
> = readonly [...BaseQueryKey, ...Data];

type UniqueOperation<Operation extends string, Operations> =
  Exclude<Operation, Operations> extends never ?
    `Operation "${Operation}" is already declared`
  : Operation;

class QueriesBuilder<
  BaseQueryKey extends BaseQueryKeyShape,
  Operations extends AnyObject = RootQueryBuilderSchema<BaseQueryKey>,
> {
  protected operations: Operations;

  constructor(private readonly $root: BaseQueryKey) {
    const rootSchema: RootQueryBuilderSchema<BaseQueryKey> = {
      $root: this.$root,
    };

    this.operations = rootSchema as never;
  }

  query<Operation extends string, Data = unknown, SelectData = Data>(
    procedure: UniqueOperation<Operation, keyof Operations>,
    options: OmitQueryKey<
      OptionsWithInitialDataStruct<
        Data,
        SelectData,
        never,
        MakeKey<BaseQueryKey, [Operation]>
      >
    >,
  ): QueriesBuilder<
    BaseQueryKey,
    Operations & {
      [Key in Operation]: QueryOptionsWithInitialData<
        Data,
        SelectData,
        MakeKey<BaseQueryKey, [Operation]>
      >;
    }
  >;

  query<Operation extends string, Data = unknown, SelectData = Data>(
    procedure: UniqueOperation<Operation, keyof Operations>,
    options: OmitQueryKey<
      OptionsStruct<Data, SelectData, never, MakeKey<BaseQueryKey, [Operation]>>
    >,
  ): QueriesBuilder<
    BaseQueryKey,
    Operations & {
      [Key in Operation]: QueryOptionsWithoutInitialData<
        Data,
        SelectData,
        MakeKey<BaseQueryKey, [Operation]>
      >;
    }
  >;

  query(procedure: string, options: AnyObject) {
    const generatedQueryKey = [...this.$root, procedure] as const;

    options.queryKey = generatedQueryKey;

    (this.operations as any)[procedure] = options;

    return this as never;
  }

  queryWithArgs<
    Operation extends string,
    Args extends readonly unknown[],
    Data = unknown,
    SelectData = Data,
    QueryKey extends RecordTuple = RecordTuple,
  >(
    procedure: UniqueOperation<Operation, keyof Operations>,
    callback: (
      ...args: Args
    ) => OptionsWithInitialDataStruct<
      Data,
      SelectData,
      QueryKey,
      MakeKey<BaseQueryKey, [Operation, ...QueryKey]>
    >,
  ): QueriesBuilder<
    BaseQueryKey,
    Operations & {
      [Pcd in Operation]: {
        $root: MakeKey<BaseQueryKey, [Operation]>;
        (
          ...args: Args
        ): QueryOptionsWithInitialData<
          Data,
          SelectData,
          MakeKey<BaseQueryKey, [Operation, ...QueryKey]>
        >;
      };
    }
  >;

  queryWithArgs<
    Operation extends string,
    Args extends readonly unknown[],
    Data = unknown,
    SelectData = Data,
    QueryKey extends RecordTuple = RecordTuple,
  >(
    procedure: UniqueOperation<Operation, keyof Operations>,
    callback: (
      ...args: Args
    ) => OptionsStruct<
      Data,
      SelectData,
      QueryKey,
      MakeKey<BaseQueryKey, [Operation, ...QueryKey]>
    >,
  ): QueriesBuilder<
    BaseQueryKey,
    Operations & {
      [Op in Operation]: {
        $root: MakeKey<BaseQueryKey, [Operation]>;
        (
          ...args: Args
        ): QueryOptionsWithoutInitialData<
          Data,
          SelectData,
          MakeKey<BaseQueryKey, [Operation, ...QueryKey]>
        >;
      };
    }
  >;

  queryWithArgs<
    Operation extends string,
    Args extends readonly unknown[],
    Data = unknown,
    SelectData = Data,
    QueryKey extends RecordTuple = RecordTuple,
    Context = unknown,
  >(
    procedure: UniqueOperation<Operation, keyof Operations>,
    callback: (
      ...args: Args
    ) => OptionsWithInitialDataStruct<
      Data,
      SelectData,
      QueryKey,
      MakeKey<BaseQueryKey, [Operation, ...QueryKey]>
    >,
    context: (
      contextBuilder: ContextOperationBuilder<
        MakeKey<BaseQueryKey, [Operation, ...QueryKey]>,
        {},
        QueryKey[0]
      >,
    ) => Context,
  ): QueriesBuilder<
    BaseQueryKey,
    Operations & {
      [Op in Operation]: {
        $root: MakeKey<BaseQueryKey, [Operation]>;
        (...args: Args): QueryOptionsWithInitialData<
          Data,
          SelectData,
          MakeKey<BaseQueryKey, [Operation, ...QueryKey]>
        > & {
          $ctx: Context extends QueriesBuilder<any, infer ContextSchema> ?
            Prettify<ContextSchema>
          : never;
        };
      };
    }
  >;

  queryWithArgs<
    Operation extends string,
    Args extends readonly unknown[],
    Data = unknown,
    SelectData = Data,
    QueryKey extends RecordTuple = RecordTuple,
    Context = unknown,
  >(
    procedure: UniqueOperation<Operation, keyof Operations>,
    callback: (
      ...args: Args
    ) => OptionsStruct<
      Data,
      SelectData,
      QueryKey,
      MakeKey<BaseQueryKey, [Operation, ...QueryKey]>
    >,
    context: (
      contextBuilder: ContextOperationBuilder<
        MakeKey<BaseQueryKey, [Operation, ...QueryKey]>,
        {},
        QueryKey[0]
      >,
    ) => Context,
  ): QueriesBuilder<
    BaseQueryKey,
    Operations & {
      [Op in Operation]: {
        $root: MakeKey<BaseQueryKey, [Operation]>;
        (...args: Args): QueryOptionsWithoutInitialData<
          Data,
          SelectData,
          MakeKey<BaseQueryKey, [Operation, ...QueryKey]>
        > & {
          $ctx: Context extends QueriesBuilder<any, infer ContextSchema> ?
            Prettify<ContextSchema>
          : never;
        };
      };
    }
  >;

  queryWithArgs(
    procedure: string,
    options: (...args: any[]) => AnyObject,
    context?: (contextBuilder: any) => any,
  ): QueriesBuilder<BaseQueryKey, {}> {
    const baseOperationQueryKey = [...this.$root, procedure] as const;

    const monkeyPatchedQueryOptions = (...args: AnyTuple) => {
      const innerOptions = options(...args);
      const [record] = innerOptions.queryKey as RecordTuple;

      const monkeyPatchedQueryKey = [...baseOperationQueryKey, record] as const;
      innerOptions.queryKey = monkeyPatchedQueryKey;

      if (context != null) {
        const monkeyPatchedContext = context(
          new PrivateContextOperationBuilder(monkeyPatchedQueryKey, record),
        );

        innerOptions.$ctx = monkeyPatchedContext.build();
      }

      return innerOptions;
    };

    monkeyPatchedQueryOptions.$root = baseOperationQueryKey;

    (this.operations as any)[procedure] = monkeyPatchedQueryOptions;

    return this as never;
  }

  mutation<Operation extends string>(
    procedure: UniqueOperation<Operation, keyof Operations>,
    context: (options: { mutate: any; keys: Operations }) => QueriesBuilder<
      BaseQueryKey,
      Operations & {
        [Op in Operation]: MutationOptions<
          Data,
          Variables,
          Context,
          MakeKey<BaseQueryKey, [Operation]>
        >;
      },
  ) {
    const mutate = <Data = unknown, Variables = void, Context = unknown>(
      procedure: UniqueOperation<Operation, keyof Operations>,
      options: (
        queryClient: Client,
      ) => MutationOptionsStruct<Data, Variables, Context>,
    ): QueriesBuilder<
      BaseQueryKey,
      Operations & {
        [Op in Operation]: MutationOptions<
          Data,
          Variables,
          Context,
          MakeKey<BaseQueryKey, [Operation]>
        >;
      }
    > => {
      const baseOperationMutationKey = [...this.$root, procedure] as const;

      (options as any).mutationKey = baseOperationMutationKey;

      (this.operations as any)[procedure] = options;

      return this as never;
    };

    return context({ mutate, keys: this.operations });
  }

  // mutation<
  //   Operation extends string,
  //   Data = unknown,
  //   Variables = void,
  //   Context = unknown,
  //   Client extends QueryClient = QueryClient,
  // >(
  //   procedure: UniqueOperation<Operation, keyof Operations>,
  //   options: (
  //     queryClient: Client,
  //   ) => MutationOptionsStruct<Data, Variables, Context>,
  // ): QueriesBuilder<
  //   BaseQueryKey,
  //   Operations & {
  //     [Op in Operation]: MutationOptions<
  //       Data,
  //       Variables,
  //       Context,
  //       MakeKey<BaseQueryKey, [Operation]>
  //     >;
  //   }
  // > {
  //   const baseOperationMutationKey = [...this.$root, procedure] as const;

  //   (options as any).mutationKey = baseOperationMutationKey;

  //   (this.operations as any)[procedure] = options;

  //   return this as never;
  // }

  infiniteQuery<
    Operation extends string,
    Data = unknown,
    PageParam = unknown,
    SelectData = InfiniteData<Data, PageParam>,
  >(
    procedure: UniqueOperation<Operation, keyof Operations>,
    options: OmitQueryKey<
      InfiniteOptionsWithInitialDataStruct<
        Data,
        SelectData,
        EmptyKey,
        MakeKey<BaseQueryKey, [Operation]>,
        PageParam
      >
    >,
  ): QueriesBuilder<
    BaseQueryKey,
    Operations & {
      [Op in Operation]: InfiniteQueryOptionsWithInitialData<
        Data,
        SelectData,
        MakeKey<BaseQueryKey, [Operation]>,
        PageParam
      >;
    }
  >;

  infiniteQuery<
    Operation extends string,
    Data = unknown,
    PageParam = unknown,
    SelectData = InfiniteData<Data, PageParam>,
  >(
    procedure: UniqueOperation<Operation, keyof Operations>,
    options: OmitQueryKey<
      InfiniteOptionsStruct<
        Data,
        SelectData,
        EmptyKey,
        MakeKey<BaseQueryKey, [Operation]>,
        PageParam
      >
    >,
  ): QueriesBuilder<
    BaseQueryKey,
    Operations & {
      [Op in Operation]: InfiniteQueryOptionsWithoutInitialData<
        Data,
        SelectData,
        MakeKey<BaseQueryKey, [Operation]>,
        PageParam
      >;
    }
  >;

  infiniteQuery(
    procedure: string,
    options: AnyObject,
  ): QueriesBuilder<BaseQueryKey, any> {
    const baseOperationQueryKey = [...this.$root, procedure] as const;
    options.queryKey = baseOperationQueryKey;

    (this.operations as any)[procedure] = options;

    return this as never;
  }

  infiniteQueryWithArgs<
    Operation extends string,
    Args extends readonly unknown[],
    Data = unknown,
    PageParam = unknown,
    SelectData = InfiniteData<Data, PageParam>,
    QueryKey extends WorkableKey = RecordTuple,
  >(
    procedure: UniqueOperation<Operation, keyof Operations>,
    callback: (
      ...args: Args
    ) => InfiniteOptionsWithInitialDataStruct<
      Data,
      SelectData,
      QueryKey,
      MakeKey<BaseQueryKey, [Operation, ...QueryKey]>,
      PageParam
    >,
  ): QueriesBuilder<
    BaseQueryKey,
    Operations & {
      [Op in Operation]: (
        ...args: Args
      ) => InfiniteQueryOptionsWithInitialData<
        Data,
        SelectData,
        MakeKey<BaseQueryKey, [Operation, ...QueryKey]>,
        PageParam
      >;
    }
  >;

  infiniteQueryWithArgs<
    Operation extends string,
    Args extends readonly unknown[],
    Data = unknown,
    PageParam = unknown,
    SelectData = InfiniteData<Data, PageParam>,
    QueryKey extends WorkableKey = RecordTuple,
  >(
    procedure: UniqueOperation<Operation, keyof Operations>,
    callback: (
      ...args: Args
    ) => InfiniteOptionsStruct<
      Data,
      SelectData,
      QueryKey,
      MakeKey<BaseQueryKey, [Operation, ...QueryKey]>,
      PageParam
    >,
  ): QueriesBuilder<
    BaseQueryKey,
    Prettify<
      Operations & {
        [Op in Operation]: (
          ...args: Args
        ) => InfiniteQueryOptionsWithoutInitialData<
          Data,
          SelectData,
          MakeKey<BaseQueryKey, [Operation, ...QueryKey]>,
          PageParam
        >;
      }
    >
  >;

  infiniteQueryWithArgs(
    procedure: string,
    options: (...args: any[]) => AnyObject,
  ): QueriesBuilder<BaseQueryKey, any> {
    const baseOperationQueryKey = [...this.$root, procedure] as const;

    const monkeyPatchedQueryOptions = (...args: AnyTuple) => {
      const innerOptions = options(...args);
      const [record] = innerOptions.queryKey as RecordTuple;

      const monkeyPatchedQueryKey = [...baseOperationQueryKey, record] as const;
      innerOptions.queryKey = monkeyPatchedQueryKey;

      return innerOptions;
    };

    (this.operations as any)[procedure] = monkeyPatchedQueryOptions;

    return this as never;
  }
}

class $QueriesBuilder<
  BaseQueryKey extends BaseQueryKeyShape,
  Schema extends AnyObject,
> extends QueriesBuilder<BaseQueryKey, Schema> {
  getQueries() {
    return this.operations;
  }
}

class ContextOperationBuilder<
  BaseQueryKey extends BaseQueryKeyShape,
  Schema extends AnyObject,
  ContextArgs extends AnyObject,
> extends QueriesBuilder<BaseQueryKey, Schema> {
  readonly args: ContextArgs;

  constructor(rootKey: BaseQueryKey, args: ContextArgs) {
    super(rootKey);

    this.args = args;
    this.operations = {} as any;
  }
}

class PrivateContextOperationBuilder<
  BaseQueryKey extends BaseQueryKeyShape,
  Schema extends AnyObject,
  ContextArgs extends AnyObject,
> extends ContextOperationBuilder<BaseQueryKey, Schema, ContextArgs> {
  getOperations() {
    return this.operations;
  }
}

export function defineQueries<Id extends string>(
  id: Id,
): Prettify<RootQueryBuilderSchema<[Id]>>;
export function defineQueries<Id extends string, Queries>(
  id: Id,
  define: (operations: QueriesBuilder<readonly [Id]>) => Queries,
): Queries extends QueriesBuilder<infer _, infer Schema> ? Prettify<Schema>
: never;
export function defineQueries(
  id: string,
  define?: (
    operations: QueriesBuilder<readonly [string], any>,
  ) => QueriesBuilder<any, any>,
): AnyObject {
  const builder = new $QueriesBuilder([id] as const);

  if (!define) {
    return builder.getQueries();
  }

  return (define(builder) as $QueriesBuilder<any, any>).getQueries();
}
