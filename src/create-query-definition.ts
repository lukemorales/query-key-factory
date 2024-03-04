import { type createQueryOptions, type QueryOptionsWithoutInitialDataResult } from './create-query-options';
import { type Prettify, type QueryDefTag } from './internals';
import { type AnyTuple, type EmptyKey, type FactoryOptions, type WorkableKey } from './primitives';

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

declare function getUser(id: string): Promise<User>;

type AnyQueryOption = FactoryOptions<Record<string, any>>;

type DynamicQueryOption = (...args: any[]) => AnyQueryOption;

type QueryDefField = AnyQueryOption | DynamicQueryOption;

export type QueryDefSchema = Record<string, QueryDefField>;

type MakeQueryKey<Key extends `$${string}`, KeyValue extends AnyTuple, QueryKey extends WorkableKey> =
  QueryKey extends [infer Data] ? [Prettify<Record<Key, KeyValue> & Data>]
  : QueryKey extends EmptyKey ? [Prettify<Record<Key, KeyValue>>]
  : never;

type SchemaOptions<Entity extends string, FieldName extends string, Field extends QueryDefField> =
  Field extends (
    (...args: any[]) => QueryOptionsWithoutInitialDataResult<infer Data, infer SelectedData, infer QueryKey>
  ) ?
    (
      ...args: Parameters<Field>
    ) => QueryOptionsWithoutInitialDataResult<Data, SelectedData, MakeQueryKey<'$query', [Entity, FieldName], QueryKey>>
  : Field extends QueryOptionsWithoutInitialDataResult<infer Data, infer SelectedData, infer QueryKey> ?
    QueryOptionsWithoutInitialDataResult<Data, SelectedData, MakeQueryKey<'$query', [Entity, FieldName], QueryKey>>
  : never;

type QueryDef<Entity extends string, Schema extends QueryDefSchema> = {
  [Key in keyof Schema & string]: SchemaOptions<Entity, Key, Schema[Key]>;
} & QueryDefTag;

function createQueryDefinition<E extends string, T extends QueryDefSchema>(
  entity: E,
  builder: (makeOptions: createQueryOptions) => T,
): QueryDef<E, T> {
  const def = builder(makeQueryOptions);

  for (const key of Object.keys(def)) {
    const entry = def[key]!;

    if (typeof entry === 'function') {
      (def as any)[key] = (...args: any[]) => {
        const result = entry(...(args as any));

        const [record] = result.queryKey;
        result.queryKey = [{ $query: [entity, key], ...record }];

        return result;
      };
    } else {
      (entry as any).queryKey = [{ $query: [entity, key] }];
    }
  }

  return def as any;
}

const users = createQueryDefinition('users', (makeOptions) => ({
  list: makeOptions({
    queryKey: [],
    queryFn: () => [] as User[],
  }),
  detail: (userId: string) =>
    makeOptions({
      queryKey: [{ userId }],
      queryFn: (ctx) => getUser(ctx.queryKey[0].userId),
      select: (data) => data.firstName,
    }),
}));

users.list.queryKey; // ?
//          ^?
users.detail('user_AFKH8912389ASKOIP').queryKey; // ?
//                                       ^?
