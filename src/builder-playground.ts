import { buildQueriesFor as queryBuilder } from './builder';
import { createQueryOptions } from './create-query-options';

interface User {
  id?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  age?: number;
}

const users = queryBuilder('users')
  .query('list', {
    queryFn: () => Promise.resolve(1),
  })
  .query('profile', (userId: string) =>
    createQueryOptions({
      queryKey: [{ userId }],
      queryFn: (ctx) => Promise.resolve<User>({ id: ctx.queryKey[0].userId }),
    }),
  )
  .mutation('create', {
    mutationFn: () => Promise.resolve<User>({}),
  })
  // .infiniteQuery('connections', ({ infiniteQueryOptions }) =>
  //   infiniteQueryOptions({
  //     queryKey: [],
  //     queryFn: () => Promise.resolve({ data: [], listMetadata: { before: 'invoice_123', after: null } }),
  //     getNextPageParam: (page) => page.listMetadata.after,
  //     getPreviousPageParam: (page) => page.listMetadata.before,
  //     initialPageParam: null,
  //   }),
  // )
  .build();

users.list().queryKey; // ?
//              ^?
users.profile('1').queryKey; // ?
//                    ^?

users.create().mutationKey; // ?
//                ^?
