import type {
  AnyObject,
  AnyTuple,
  EmptyKey,
  OmitQueryKey,
  Prettify,
} from './new-types';
import type { MutationOptionsStruct } from './options';

class MutationsBuilder {
  protected operations: AnyObject = {};

  mutation<Operation extends string, Data = unknown, Variables = void>(
    procedure: Operation,
    options: OmitQueryKey<
      MutationOptionsStruct<Data, Variables, EmptyKey, EmptyKey>
    >,
  ): MutationsBuilder {
    (this.operations as any)[procedure] = options;

    return this as never;
  }
}

type BaseOperationsSchema<QueryKey extends AnyTuple> = {
  $root: Readonly<QueryKey>;
};

class $MutationsBuilder extends MutationsBuilder {
  getMutations() {
    return this.operations;
  }
}

export function defineMutations<Id extends string>(
  id: Id,
): Prettify<BaseOperationsSchema<[Id]>>;
export function defineMutations<Id extends string, Mutations>(
  id: Id,
  define: (operations: MutationsBuilder) => Mutations,
): Mutations extends MutationsBuilder ? Prettify<Mutations['getMutations']>
: never;
export function defineMutations(
  id: string,
  define?: (operations: MutationsBuilder) => MutationsBuilder,
): AnyObject {
  const builder = new $MutationsBuilder([id] as const);

  if (!define) {
    return builder.getMutations();
  }

  return (define(builder) as $MutationsBuilder).getMutations();
}
