import { createQueryOptions, type QueryOptionsWithoutInitialDataResult } from './create-query-options';
import { type Prettify, type QueryDefTag } from './internals';
import { type AnyTuple, type EmptyKey, type FactoryOptions, type WorkableKey } from './primitives';

type QueryObject<T extends AnyTuple, Extendable = unknown> = Prettify<{ $query: T } & Extendable>;

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

type MakeQueryKey<Scope extends AnyTuple, QueryKey extends WorkableKey = EmptyKey> =
  QueryKey extends [infer Data] ? readonly [QueryObject<Scope, Data>]
  : QueryKey extends EmptyKey ? readonly [QueryObject<Scope>]
  : never;

type SchemaOptions<Entity extends string, FieldName extends string, Field extends QueryDefField> =
  Field extends (
    (...args: any[]) => QueryOptionsWithoutInitialDataResult<infer Data, infer SelectedData, infer QueryKey>
  ) ?
    (
      ...args: Parameters<Field>
    ) => QueryOptionsWithoutInitialDataResult<Data, SelectedData, MakeQueryKey<[Entity, FieldName], QueryKey>>
  : Field extends QueryOptionsWithoutInitialDataResult<infer Data, infer SelectedData, infer QueryKey> ?
    QueryOptionsWithoutInitialDataResult<Data, SelectedData, MakeQueryKey<[Entity, FieldName], QueryKey>>
  : never;

type QueryDef<Feature extends string, Schema extends QueryDefSchema> = Prettify<
  { feature: { queryKey: MakeQueryKey<[Feature]> } } & {
    [Key in keyof Schema & string]: SchemaOptions<Feature, Key, Schema[Key]>;
  } & QueryDefTag
>;

export function createQueries<Feature extends string, Schema extends QueryDefSchema>(
  feature: Feature,
  builder: (options: { queryOptions: createQueryOptions }) => Schema,
): QueryDef<Feature, Schema> {
  const schema = builder({ queryOptions: createQueryOptions });

  for (const key of Object.keys(schema)) {
    const entry = schema[key]!;

    if (typeof entry === 'function') {
      (schema as any)[key] = (...args: any[]) => {
        const result = entry(...(args as any));
        const [record] = result.queryKey as [Record<string, unknown>];

        const queryKey: MakeQueryKey<[string, string]> = [{ $query: [feature, key], ...record }];
        result.queryKey = queryKey;

        return result;
      };
    } else {
      const queryKey: MakeQueryKey<[string, string]> = [{ $query: [feature, key] }];
      (entry as any).queryKey = queryKey;
    }
  }

  const defQueryKey: MakeQueryKey<[string]> = [{ $query: [feature] }];
  (schema as any).$def = { queryKey: defQueryKey };

  return schema as any;
}

const users = createQueries('users', ({ queryOptions }) => ({
  list: queryOptions({
    queryKey: [],
    queryFn: () => [] as User[],
  }),
  detail: (userId: string) =>
    queryOptions({
      queryKey: [{ userId }],
      queryFn: (ctx) => getUser(ctx.queryKey[0].userId),
      select: (data) => data.firstName,
    }),
}));

users.feature.queryKey;
//            ^?

users.list.queryKey; // ?
//          ^?
users.detail('user_AFKH8912389ASKOIP').queryKey; // ?
//                                       ^?
