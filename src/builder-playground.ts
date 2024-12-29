/* eslint-disable no-unused-expressions */

import { defineQueries } from './define-query-operations';

declare function getCurrentUser(): Promise<User>;

declare function getUser(id: string): Promise<User>;

declare function getPaginatedUsers(filters?: any): Promise<{
  data: User[];
  metadata: { before: string | null; after: string | null };
}>;

declare function createUser(options: Record<string, unknown>): Promise<User>;

interface User {
  id?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  age?: number;
}

const users = defineQueries(
  'users',
  (schema) =>
    schema
      .query('me', {
        queryFn: getCurrentUser,
      })
      .queryWithArgs('profile', (userId: string) => ({
        queryKey: [{ userId }],
        queryFn: (ctx) => getUser(ctx.queryKey[2].userId),
      }))
      .queryWithArgs(
        'profileWithContext',
        (userId: string) => ({
          queryKey: [{ userId }],
          queryFn: (ctx) => getUser(ctx.queryKey[2].userId),
        }),
        (context) =>
          context
            .query('todos', {
              queryFn: async ({ queryKey }) => [queryKey[2].userId],
            })
            .queryWithArgs('todo', (todoId: string) => ({
              // eslint-disable-next-line @tanstack/query/exhaustive-deps
              queryKey: [{ todoId }],
              queryFn: (_) => Promise.resolve({ id: context.args.userId }),
            })),
      )
      .infiniteQuery('list', {
        queryFn: (ctx) => getPaginatedUsers(ctx.pageParam),
        getNextPageParam: ({ metadata }) => metadata.before,
        initialPageParam: null as string | null,
      })
      .mutation(({ define, operations }) => {}),
  // .mutation('create', (queryClient: QueryClient) => ({
  //   mutationFn: createUser,
  //   onSuccess: (data, variables, context) => {
  //     invalidateQueries('users');
  //   },
  // })),
);

users.$root;
//      ^?
users.me.queryKey;
//            ^?
users.profileWithContext('user_01').$ctx.todo('todo_01').queryKey;
//                                                          ^?

users.list.queryKey;
//              ^?

users.create.mutationKey;
//                ^?
