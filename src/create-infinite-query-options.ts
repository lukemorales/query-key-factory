import {
  type DataTag,
  type DefaultError,
  type DefinedInitialDataInfiniteOptions,
  type InfiniteData,
  type UndefinedInitialDataInfiniteOptions,
  type WithRequired,
} from '@tanstack/react-query';

import { type EmptyKey, type FactoryOptions, type WorkableKey } from './primitives';

export type InfiniteOptions<
  Data,
  SelectData = InfiniteData<Data>,
  Key extends WorkableKey = EmptyKey,
  PageParam = unknown,
> = WithRequired<UndefinedInitialDataInfiniteOptions<Data, DefaultError, SelectData, Key, PageParam>, 'queryFn'>;

export type InfiniteQueryOptionsWithoutInitialDataResult<
  Data,
  SelectData = InfiniteData<Data>,
  Key extends WorkableKey = EmptyKey,
  PageParam = unknown,
> = FactoryOptions<
  InfiniteOptions<Data, SelectData, Key, PageParam> & {
    queryKey: DataTag<Key, InfiniteData<Data>>;
  }
>;

type InfiniteOptionsWithInitialData<
  Data,
  SelectData = InfiniteData<Data>,
  Key extends WorkableKey = EmptyKey,
  PageParam = unknown,
> = WithRequired<DefinedInitialDataInfiniteOptions<Data, DefaultError, SelectData, Key, PageParam>, 'queryFn'>;

export type InfiniteQueryOptionsWithInitialDataResult<
  Data,
  SelectData = InfiniteData<Data>,
  Key extends WorkableKey = EmptyKey,
  PageParam = unknown,
> = FactoryOptions<
  InfiniteOptionsWithInitialData<Data, SelectData, Key, PageParam> & {
    queryKey: DataTag<Key, InfiniteData<Data>>;
  }
>;

export function createInfiniteQueryOptions<
  Data = unknown,
  SelectData = InfiniteData<Data>,
  Key extends WorkableKey = EmptyKey,
  PageParam = unknown,
>(
  options: InfiniteOptions<Data, SelectData, Key, PageParam>,
): InfiniteQueryOptionsWithoutInitialDataResult<Data, SelectData, Key, PageParam>;
export function createInfiniteQueryOptions<
  Data = unknown,
  SelectData = InfiniteData<Data>,
  Key extends WorkableKey = EmptyKey,
  PageParam = unknown,
>(
  options: InfiniteOptionsWithInitialData<Data, SelectData, Key, PageParam>,
): InfiniteQueryOptionsWithInitialDataResult<Data, SelectData, Key, PageParam>;
export function createInfiniteQueryOptions(options: unknown) {
  return options;
}

export type createInfiniteQueryOptions = typeof createInfiniteQueryOptions;
