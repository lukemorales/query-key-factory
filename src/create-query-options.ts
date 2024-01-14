import {
  type DataTag,
  type DefaultError,
  type DefinedInitialDataOptions,
  type UndefinedInitialDataOptions,
} from '@tanstack/react-query';

import { type EmptyKey, type FactoryOptions, type WorkableKey } from './primitives';

export type Options<Data, SelectData, Key extends WorkableKey = EmptyKey> = UndefinedInitialDataOptions<
  Data,
  DefaultError,
  SelectData,
  Key
>;

export type QueryOptionsWithoutInitialDataResult<Data, SelectData, Key extends WorkableKey> = FactoryOptions<
  Options<Data, SelectData, Key> & {
    queryKey: DataTag<Key, Data>;
  }
>;

type OptionsWithInitialData<Data, SelectData, Key extends WorkableKey = EmptyKey> = DefinedInitialDataOptions<
  Data,
  DefaultError,
  SelectData,
  Key
>;

export type QueryOptionsWithInitialDataResult<Data, SelectData, Key extends WorkableKey> = FactoryOptions<
  OptionsWithInitialData<Data, SelectData, Key> & {
    queryKey: DataTag<Key, Data>;
  }
>;

export function makeQueryOptions<Data = unknown, SelectData = Data, Key extends WorkableKey = EmptyKey>(
  options: Options<Data, SelectData, Key>,
): QueryOptionsWithoutInitialDataResult<Data, SelectData, Key>;
export function makeQueryOptions<Data = unknown, SelectData = Data, Key extends WorkableKey = EmptyKey>(
  options: OptionsWithInitialData<Data, SelectData, Key>,
): QueryOptionsWithInitialDataResult<Data, SelectData, Key>;
export function makeQueryOptions(options: unknown) {
  return options;
}

export type makeQueryOptions = typeof makeQueryOptions;

const result = makeQueryOptions({
  //    ^?
  queryKey: [],
});

result.queryKey;
