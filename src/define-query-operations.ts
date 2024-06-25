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

type BaseOperationsSchema<QueryKey extends AnyTuple> = {
  $baseQueryKey: Readonly<QueryKey>;
};

type MakeKey<
  BaseQueryKey extends AnyTuple,
  Data extends AnyTuple = AnyTuple,
> = readonly [...BaseQueryKey, ...Data];

type UniqueOperation<Operation extends string, Operations> =
  Exclude<Operation, Operations> extends never ?
    `Operation "${Operation}" is already declared`
  : Operation;

class OperationBuilder<
  BaseQueryKey extends BaseQueryKeyShape,
  Operations extends AnyObject = BaseOperationsSchema<BaseQueryKey>,
> {
  protected operations: Operations;

  constructor(private readonly $baseQueryKey: BaseQueryKey) {
    const baseSchema: BaseOperationsSchema<BaseQueryKey> = {
      $baseQueryKey: this.$baseQueryKey,
    };

    this.operations = baseSchema as never;
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
  ): OperationBuilder<
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
  ): OperationBuilder<
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
    const generatedQueryKey = [...this.$baseQueryKey, procedure] as const;

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
  ): OperationBuilder<
    BaseQueryKey,
    Operations & {
      [Pcd in Operation]: {
        $baseQueryKey: MakeKey<BaseQueryKey, [Operation]>;
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
  ): OperationBuilder<
    BaseQueryKey,
    Operations & {
      [Op in Operation]: {
        $baseQueryKey: MakeKey<BaseQueryKey, [Operation]>;
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
  ): OperationBuilder<
    BaseQueryKey,
    Operations & {
      [Op in Operation]: {
        $baseQueryKey: MakeKey<BaseQueryKey, [Operation]>;
        (...args: Args): QueryOptionsWithInitialData<
          Data,
          SelectData,
          MakeKey<BaseQueryKey, [Operation, ...QueryKey]>
        > & {
          $ctx: Context extends OperationBuilder<any, infer ContextSchema> ?
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
  ): OperationBuilder<
    BaseQueryKey,
    Operations & {
      [Op in Operation]: {
        $baseQueryKey: MakeKey<BaseQueryKey, [Operation]>;
        (...args: Args): QueryOptionsWithoutInitialData<
          Data,
          SelectData,
          MakeKey<BaseQueryKey, [Operation, ...QueryKey]>
        > & {
          $ctx: Context extends OperationBuilder<any, infer ContextSchema> ?
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
  ): OperationBuilder<BaseQueryKey, {}> {
    const baseOperationQueryKey = [...this.$baseQueryKey, procedure] as const;

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

    monkeyPatchedQueryOptions.$baseQueryKey = baseOperationQueryKey;

    (this.operations as any)[procedure] = monkeyPatchedQueryOptions;

    return this as never;
  }

  mutation<
    Operation extends string,
    Data = unknown,
    Variables = void,
    Context = unknown,
  >(
    procedure: UniqueOperation<Operation, keyof Operations>,
    options: MutationOptionsStruct<Data, Variables, Context>,
  ): OperationBuilder<
    BaseQueryKey,
    Operations & {
      [Op in Operation]: MutationOptions<
        Data,
        Variables,
        Context,
        MakeKey<BaseQueryKey, [Operation]>
      >;
    }
  > {
    const baseOperationMutationKey = [
      ...this.$baseQueryKey,
      procedure,
    ] as const;

    (options as any).mutationKey = baseOperationMutationKey;

    (this.operations as any)[procedure] = options;

    return this as never;
  }

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
  ): OperationBuilder<
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
  ): OperationBuilder<
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
  ): OperationBuilder<BaseQueryKey, any> {
    const baseOperationQueryKey = [...this.$baseQueryKey, procedure] as const;
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
  ): OperationBuilder<
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
  ): OperationBuilder<
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
  ): OperationBuilder<BaseQueryKey, any> {
    const baseOperationQueryKey = [...this.$baseQueryKey, procedure] as const;

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

class PrivateOperationBuilder<
  BaseQueryKey extends BaseQueryKeyShape,
  Schema extends AnyObject,
> extends OperationBuilder<BaseQueryKey, Schema> {
  getOperations() {
    return this.operations;
  }
}

class ContextOperationBuilder<
  BaseQueryKey extends BaseQueryKeyShape,
  Schema extends AnyObject,
  ContextArgs extends AnyObject,
> extends OperationBuilder<BaseQueryKey, Schema> {
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

export function defineQueryOperations<Id extends string>(
  id: Id,
): Prettify<BaseOperationsSchema<[Id]>>;
export function defineQueryOperations<Id extends string, Operations>(
  id: Id,
  define: (operations: OperationBuilder<readonly [Id]>) => Operations,
): Operations extends OperationBuilder<infer _, infer Schema> ? Prettify<Schema>
: never;
export function defineQueryOperations(
  id: string,
  define?: (
    operations: OperationBuilder<readonly [string], any>,
  ) => OperationBuilder<any, any>,
): AnyObject {
  const builder = new PrivateOperationBuilder([id] as const);

  if (!define) {
    return builder.getOperations();
  }

  return (define(builder) as PrivateOperationBuilder<any, any>).getOperations();
}
