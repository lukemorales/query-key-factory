import { buildQueriesFor as queryBuilder } from './builder.v2';

interface User {
  firstname: string;
  lastname: string;
  email: string;
  age: number;
}

const users = queryBuilder('users')
  .query('list', ({ queryOptions }) =>
    queryOptions({
      queryKey: [],
      queryFn: () => Promise.resolve(1),
    }),
  ) // eslint-disable-next-line arrow-body-style
  .query('profile', () => {
    return (userId: string) =>
      makeQueryOptions({
        queryKey: [],
        queryFn: () => Promise.resolve({ id: userId } as User),
      });
  })
  .mutation('create', ({ mutationOptions }) =>
    mutationOptions({
      mutationFn: () => Promise.resolve({} as User),
    }),
  )
  .infiniteQuery('connections', ({ infiniteQueryOptions }) =>
    infiniteQueryOptions({
      queryKey: [],
      queryFn: () => Promise.resolve({ data: [], listMetadata: { before: 'invoice_123', after: null } }),
      getNextPageParam: (page) => page.listMetadata.after,
      getPreviousPageParam: (page) => page.listMetadata.before,
      initialPageParam: null,
    }),
  )
  .build();

users.list().queryKey; // ?
//              ^?
users.profile('1').queryKey; // ?
//                    ^?

users.create().mutationKey; // ?
//                ^?
