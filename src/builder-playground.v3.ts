import { buildQueriesFor as queryBuilder } from './builder.v3';
import { createQueryOptions } from './create-query-options';

interface User {
  id?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  age?: number;
}

const users = queryBuilder('users', (builder) =>
  builder
    .query('list', {
      queryKey: [],
      queryFn: () => Promise.resolve(1),
    })
    .query('profile', (userId: string) =>
      createQueryOptions({
        queryKey: [{ userId }],
        queryFn: (ctx) => Promise.resolve<User>({ id: ctx.queryKey[0].userId }),
      }),
    )
    .query('user', (q) =>
      q.base((userId: string) =>
        createQueryOptions({
          queryKey: [{ userId }],
          queryFn: () => Promise.resolve({ id: userId }),
        }),
      ),
    )
    .mutation('create', {
      mutationFn: () => Promise.resolve<User>({}),
    }),
);

users.list().queryKey; // ?
//              ^?
users.profile('1').queryKey; // ?
//                    ^?

users.create().mutationKey; // ?
//                ^?
