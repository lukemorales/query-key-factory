import { type DefaultError, type UseMutationOptions, type WithRequired } from '@tanstack/react-query';

import { type FactoryOptions } from './primitives';

export type MutationOptions<Data = unknown, Variables = void, Context = unknown> = Omit<
  WithRequired<UseMutationOptions<Data, DefaultError, Variables, Context>, 'mutationFn'>,
  'mutationKey'
>;

export type MutationOptionsResult<Data, Variables, Context> = FactoryOptions<MutationOptions<Data, Variables, Context>>;

export function createMutationOptions<Data = unknown, Variables = void, Context = unknown>(
  options: MutationOptions<Data, Variables, Context>,
): MutationOptionsResult<Data, Variables, Context> {
  return options as any;
}

export type createMutationOptions = typeof createMutationOptions;
