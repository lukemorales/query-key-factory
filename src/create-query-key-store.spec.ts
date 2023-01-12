import { QueryFunction } from '@tanstack/query-core';

import { createQueryKeyStore } from './create-query-key-store';
import { inferQueryKeyStore } from './types';

describe('createQueryKeyStore', () => {
  it('creates a store from the schema provided as argument', () => {
    interface Filters {
      preview: boolean;
      status: 'completed' | 'in-progress';
    }

    const store = createQueryKeyStore({
      users: {
        me: null,
        detail: (userId: string) => ({
          queryKey: [userId],
          queryFn: () => Promise.resolve({ id: userId }),
          contextQueries: {
            settings: null,
          },
        }),
      },
      todos: {
        detail: (todoId: string) => [todoId],
        list: (filters: Filters) => [{ filters }],
        search: (query: string, limit: number) => [query, limit],
      },
    });

    expect(Object.keys(store)).toHaveLength(2);

    expect(store).toHaveProperty('users');
    expect(store).toHaveProperty('todos');

    expect(store).toEqual({
      users: {
        _def: ['users'],
        me: {
          queryKey: ['users', 'me'],
        },
        detail: expect.any(Function),
      },
      todos: {
        _def: ['todos'],
        detail: expect.any(Function),
        list: expect.any(Function),
        search: expect.any(Function),
      },
    });

    expect(store).toHaveType<{
      users: {
        _def: readonly ['users'];
        me: {
          queryKey: readonly ['users', 'me'];
        };
        detail: {
          _def: readonly ['users', 'detail'];
        } & ((userId: string) => {
          queryKey: readonly ['users', 'detail', string];
          queryFn: QueryFunction<{ id: string }, readonly ['users', 'detail', string]>;
          _ctx: {
            settings: {
              queryKey: readonly ['users', 'detail', string, 'settings'];
            };
          };
        });
      };
      todos: {
        _def: readonly ['todos'];
        detail: {
          _def: readonly ['todos', 'detail'];
        } & ((todoId: string) => {
          queryKey: readonly ['todos', 'detail', string];
        });
        list: {
          _def: readonly ['todos', 'list'];
        } & ((filters: Filters) => {
          queryKey: readonly ['todos', 'list', { filters: Filters }];
        });
        search: {
          _def: readonly ['todos', 'search'];
        } & ((
          query: string,
          limit: number,
        ) => {
          queryKey: readonly ['todos', 'search', string, number];
        });
      };
    }>();

    expect({} as inferQueryKeyStore<typeof store>).toHaveStrictType<{
      users: {
        _def: readonly ['users'];
        me: {
          queryKey: readonly ['users', 'me'];
        };
        detail: {
          _def: readonly ['users', 'detail'];
          queryKey: readonly ['users', 'detail', string];
          _ctx: {
            settings: {
              queryKey: readonly ['users', 'detail', string, 'settings'];
            };
          };
        };
      };
      todos: {
        _def: readonly ['todos'];
        detail: {
          _def: readonly ['todos', 'detail'];
          queryKey: readonly ['todos', 'detail', string];
        };
        list: {
          _def: readonly ['todos', 'list'];
          queryKey: readonly ['todos', 'list', { filters: Filters }];
        };
        search: {
          _def: readonly ['todos', 'search'];
          queryKey: readonly ['todos', 'search', string, number];
        };
      };
    }>();
  });
});
