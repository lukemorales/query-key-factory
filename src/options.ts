import type {
  DataTag,
  DefaultError,
  DefinedInitialDataInfiniteOptions,
  DefinedInitialDataOptions,
  InfiniteData,
  UndefinedInitialDataInfiniteOptions,
  UndefinedInitialDataOptions,
  UseMutationOptions,
} from '@tanstack/react-query';

import type { AnyTuple, BaseOptions, EmptyKey, OmitQueryKey, WithRequired, WorkableKey } from './new-types';

export type OptionsStruct<
  Data,
  SelectData = Data,
  UserInputKey extends WorkableKey = EmptyKey,
  GeneratedKey extends AnyTuple = AnyTuple,
> = BaseOptions<UndefinedInitialDataOptions<Data, DefaultError, SelectData, GeneratedKey>> & {
  queryKey: UserInputKey;
};

export type QueryOptionsWithoutInitialData<
  Data,
  SelectData = Data,
  QueryKey extends AnyTuple = AnyTuple,
> = OmitQueryKey<OptionsStruct<Data, SelectData, EmptyKey, QueryKey>> & {
  queryKey: DataTag<QueryKey, Data>;
};

export type OptionsWithInitialDataStruct<
  Data,
  SelectData = Data,
  UserInputKey extends WorkableKey = EmptyKey,
  GeneratedKey extends AnyTuple = AnyTuple,
> = BaseOptions<DefinedInitialDataOptions<Data, DefaultError, SelectData, GeneratedKey>> & {
  queryKey: UserInputKey;
};

export type QueryOptionsWithInitialData<
  Data,
  SelectData = Data,
  QueryKeyKey extends AnyTuple = AnyTuple,
> = OmitQueryKey<OptionsWithInitialDataStruct<Data, SelectData, EmptyKey, QueryKeyKey>> & {
  queryKey: DataTag<QueryKeyKey, Data>;
};

export type InfiniteOptionsStruct<
  Data,
  SelectData = InfiniteData<Data>,
  QueryKey extends WorkableKey = EmptyKey,
  GeneratedKey extends AnyTuple = AnyTuple,
  PageParam = unknown,
> = BaseOptions<UndefinedInitialDataInfiniteOptions<Data, DefaultError, SelectData, GeneratedKey, PageParam>> & {
  queryKey: QueryKey;
};

export type InfiniteQueryOptionsWithoutInitialData<
  Data,
  SelectData = InfiniteData<Data>,
  Key extends AnyTuple = AnyTuple,
  PageParam = unknown,
> = OmitQueryKey<InfiniteOptionsStruct<Data, SelectData, EmptyKey, Key, PageParam>> & {
  queryKey: DataTag<Key, InfiniteData<Data, PageParam>>;
};

export type InfiniteOptionsWithInitialDataStruct<
  Data,
  SelectData = InfiniteData<Data>,
  QueryKey extends WorkableKey = EmptyKey,
  GeneratedKey extends AnyTuple = AnyTuple,
  PageParam = unknown,
> = BaseOptions<DefinedInitialDataInfiniteOptions<Data, DefaultError, SelectData, GeneratedKey, PageParam>> & {
  queryKey: QueryKey;
};

export type InfiniteQueryOptionsWithInitialData<
  Data,
  SelectData = InfiniteData<Data>,
  Key extends AnyTuple = AnyTuple,
  PageParam = unknown,
> = OmitQueryKey<InfiniteOptionsWithInitialDataStruct<Data, SelectData, EmptyKey, Key, PageParam>> & {
  queryKey: DataTag<Key, InfiniteData<Data, PageParam>>;
};

export type MutationOptionsStruct<Data = unknown, Variables = void, Context = unknown> = Omit<
  WithRequired<UseMutationOptions<Data, DefaultError, Variables, Context>, 'mutationFn'>,
  'mutationKey'
>;

export type MutationOptions<Data, Variables, Context, MutationKey = EmptyKey> = MutationOptionsStruct<
  Data,
  Variables,
  Context
> & {
  mutationKey: MutationKey;
};
