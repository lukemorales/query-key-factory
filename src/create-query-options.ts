import {
  type DataTag,
  type DefaultError,
  type DefinedInitialDataOptions,
  type UndefinedInitialDataOptions,
  type WithRequired,
} from '@tanstack/react-query';

import { type EmptyKey, type FactoryOptions, type WorkableKey } from './primitives';

export type Options<Data, SelectData = Data, Key extends WorkableKey = EmptyKey> = WithRequired<
  UndefinedInitialDataOptions<Data, DefaultError, SelectData, Key>,
  'queryFn'
>;

export type QueryOptionsWithoutInitialDataResult<
  Data,
  SelectData = Data,
  Key extends WorkableKey = EmptyKey,
> = FactoryOptions<
  Options<Data, SelectData, Key> & {
    queryKey: DataTag<Key, Data>;
  }
>;

export type OptionsWithInitialData<Data, SelectData = Data, Key extends WorkableKey = EmptyKey> = WithRequired<
  DefinedInitialDataOptions<Data, DefaultError, SelectData, Key>,
  'queryFn'
>;

export type QueryOptionsWithInitialDataResult<
  Data,
  SelectData = Data,
  Key extends WorkableKey = EmptyKey,
> = FactoryOptions<
  OptionsWithInitialData<Data, SelectData, Key> & {
    queryKey: DataTag<Key, Data>;
  }
>;

export function createQueryOptions<Data = unknown, SelectData = Data, Key extends WorkableKey = EmptyKey>(
  options: Options<Data, SelectData, Key>,
): QueryOptionsWithoutInitialDataResult<Data, SelectData, Key>;
export function createQueryOptions<Data = unknown, SelectData = Data, Key extends WorkableKey = EmptyKey>(
  options: OptionsWithInitialData<Data, SelectData, Key>,
): QueryOptionsWithInitialDataResult<Data, SelectData, Key>;
export function createQueryOptions(options: unknown) {
  return options;
}

export type createQueryOptions = typeof createQueryOptions;

const result = createQueryOptions({
  //    ^?
  queryKey: [],
  queryFn: () => Promise.resolve('hello world'),
});

result.queryKey;
