<p align="center">
  <a href="https://github.com/lukemorales/query-key-factory" target="\_parent"><img src="https://images.emojiterra.com/mozilla/512px/1f3ed.png" alt="Factory emoji" height="130"></a>
</p>

<h1 align="center">Query Key Factory</h1>

<p align="center">
  <a href="https://github.com/lukemorales/query-key-factory/actions/workflows/tests.yml" target="\_parent"><img src="https://github.com/lukemorales/query-key-factory/actions/workflows/tests.yml/badge.svg?branch=main" alt="Latest build"></a>
  <a href="https://www.npmjs.com/package/@lukemorales/query-key-factory" target="\_parent"><img src="https://badgen.net/npm/v/@lukemorales/query-key-factory" alt="Latest published version"></a>
  <a href="https://bundlephobia.com/package/@lukemorales/query-key-factory@latest" target="\_parent"><img src="https://badgen.net/bundlephobia/minzip/@lukemorales/query-key-factory" alt="Bundlephobia"></a>
  <a href="https://bundlephobia.com/package/@lukemorales/query-key-factory@latest" target="\_parent"><img src="https://badgen.net/bundlephobia/tree-shaking/@lukemorales/query-key-factory" alt="Tree shaking available"></a>
  <a href="https://github.com/lukemorales/query-key-factory" target="\_parent"><img src="https://badgen.net/npm/types/@lukemorales/query-key-factory" alt="Types included"></a>
  <a href="https://www.npmjs.com/package/@lukemorales/query-key-factory" target="\_parent"><img src="https://badgen.net/npm/license/@lukemorales/query-key-factory" alt="License"></a>
  <a href="https://www.npmjs.com/package/@lukemorales/query-key-factory" target="\_parent"><img src="https://badgen.net/npm/dt/@lukemorales/query-key-factory" alt="Number of downloads"></a>
  <a href="https://github.com/lukemorales/query-key-factory" target="\_parent"><img src="https://img.shields.io/github/stars/lukemorales/query-key-factory.svg?style=social&amp;label=Star" alt="GitHub Stars"></a>
</p>

<p align="center">
  <strong>Typesafe query key management for <a href="https://tanstack.com/query" target="\_parent">@tanstack/query</a> with auto-completion features.</strong>
</p>

<p align="center">
  Focus on writing and invalidating queries without the hassle of remembering<br/> how you've set up a key for a specific query! This lib will take care of the rest.
</p>

## 📦 Install
Query Key Factory is available as a package on NPM, install with your favorite package manager:

```dircolors
npm install @lukemorales/query-key-factory
```

## ⚡ Quick start
Start by defining the query keys for the features of your app:

### Declare your store in a single file
```ts
import { createQueryKeyStore } from "@lukemorales/query-key-factory";

// if you prefer to declare everything in one file
export const queries = createQueryKeyStore({
  users: {
    all: null,
    detail: (userId: string) => ({
      queryKey: [userId],
      queryFn: () => api.getUser(userId),
    }),
  },
  todos: {
    detail: (todoId: string) => [todoId],
    list: (filters: TodoFilters) => ({
      queryKey: [{ filters }],
      queryFn: (ctx) => api.getTodos({ filters, page: ctx.pageParam }),
      contextQueries: {
        search: (query: string, limit = 15) => ({
          queryKey: [query, limit],
          queryFn: (ctx) => api.getSearchTodos({
            page: ctx.pageParam,
            filters,
            limit,
            query,
          }),
        }),
      },
    }),
  },
});
```

### Fine-grained declaration colocated by features
```ts
import { createQueryKeys, mergeQueryKeys } from "@lukemorales/query-key-factory";

// queries/users.ts
export const users = createQueryKeys('users', {
  all: null,
  detail: (userId: string) => ({
    queryKey: [userId],
    queryFn: () => api.getUser(userId),
  }),
});

// queries/todos.ts
export const todos = createQueryKeys('todos', {
  detail: (todoId: string) => [todoId],
  list: (filters: TodoFilters) => ({
    queryKey: [{ filters }],
    queryFn: (ctx) => api.getTodos({ filters, page: ctx.pageParam }),
    contextQueries: {
      search: (query: string, limit = 15) => ({
        queryKey: [query, limit],
        queryFn: (ctx) => api.getSearchTodos({
          page: ctx.pageParam,
          filters,
          limit,
          query,
        }),
      }),
    },
  }),
});

// queries/index.ts
export const queries = mergeQueryKeys(users, todos);
```

Use throughout your codebase as the single source for writing the query keys, or even the complete queries for your cache management:

```ts
import { queries } from '../queries';

export function useUsers() {
  return useQuery({
    ...queries.users.all,
    queryFn: () => api.getUsers(),
  });
};

export function useUserDetail(id: string) {
  return useQuery(queries.users.detail(id));
};
```

```ts
import { queries } from '../queries';

export function useTodos(filters: TodoFilters) {
  return useQuery(queries.todos.list(filters));
};

export function useSearchTodos(filters: TodoFilters, query: string, limit = 15) {
  return useQuery({
    ...queries.todos.list(filters)._ctx.search(query, limit),
    enabled: Boolean(query),
  });
};

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation(updateTodo, {
    onSuccess(newTodo) {
      queryClient.setQueryData(queries.todos.detail(newTodo.id).queryKey, newTodo);

      // invalidate all the list queries
      queryClient.invalidateQueries({
        queryKey: queries.todos.list._def,
        refetchActive: false,
      });
    },
  });
};
```
<br />

## 📝 Features

### Standardized keys
All keys generated follow the @tanstack/query convention of being an [array at top level](https://tanstack.com/query/v4/docs/guides/query-keys), including [keys with serializable objects](https://tanstack.com/query/v4/docs/guides/query-keys#array-keys-with-variables):

```ts
export const todos = createQueryKeys('todos', {
  detail: (todoId: string) => [todoId],
  list: (filters: TodoFilters) => ({
    queryKey: [{ filters }],
  }),
});

// => createQueryKeys output:
// {
//   _def: ['todos'],
//   detail: (todoId: string) => {
//     queryKey: ['todos', 'detail', todoId],
//   },
//   list: (filters: TodoFilters) => {
//     queryKey: ['todos', 'list', { filters }],
//   },
// }
```

### Generate the query options you need to run `useQuery`
Declare your `queryKey` and your `queryFn` together, and have easy access to everything you need to run a query:

```ts
export const users = createQueryKeys('users', {
  detail: (userId: string) => ({
    queryKey: [userId],
    queryFn: () => api.getUser(userId),
  }),
});

// => createQueryKeys output:
// {
//   _def: ['users'],
//   detail: (userId: string) => {
//     queryKey: ['users', 'detail', userId],
//     queryFn: (ctx: QueryFunctionContext) => api.getUser(userId),
//   },
// }

export function useUserDetail(id: string) {
  return useQuery(users.detail(id));
};
```

### Generate contextual queries
Declare queries that are dependent or related to a parent context (e.g.: all likes from a user):

```ts
export const users = createQueryKeys('users', {
  detail: (userId: string) => ({
    queryKey: [userId],
    queryFn: () => api.getUser(userId),
    contextQueries: {
      likes: {
        queryKey: null,
        queryFn: () => api.getUserLikes(userId),
      },
    },
  }),
});

// => createQueryKeys output:
// {
//   _def: ['users'],
//   detail: (userId: string) => {
//     queryKey: ['users', 'detail', userId],
//     queryFn: (ctx: QueryFunctionContext) => api.getUser(userId),
//     _ctx: {
//       likes: {
//         queryKey: ['users', 'detail', userId, 'likes'],
//         queryFn: (ctx: QueryFunctionContext) => api.getUserLikes(userId),
//       },
//     },
//   },
// }

export function useUserLikes(userId: string) {
  return useQuery(users.detail(userId)._ctx.likes);
};
```

### Access to serializable keys scope definition
Easy way to access the serializable key scope and invalidate all cache for that context:

```ts
users.detail(userId).queryKey; // => ['users', 'detail', userId]
users.detail._def; // => ['users', 'detail']
```

### Create a single point of access for all your query keys

#### Declare your query keys store in a single file
Just one place to edit and maintain your store:
```ts
export const queries = createQueryKeyStore({
  users: {
    all: null,
    detail: (userId: string) => ({
      queryKey: [userId],
      queryFn: () => api.getUser(userId),
    }),
  },
  todos: {
    detail: (todoId: string) => [todoId],
    list: (filters: TodoFilters) => ({
      queryKey: [{ filters }],
      queryFn: (ctx) => api.getTodos({ filters, page: ctx.pageParam }),
    }),
  },
});
```

#### Declare your query keys by feature
Have fine-grained control over your features' keys and merge them into a single object to have access to all your query keys in your codebase:

```ts
// queries/users.ts
export const users = createQueryKeys('users', {
  all: null,
  detail: (userId: string) => ({
    queryKey: [userId],
    queryFn: () => api.getUser(userId),
  }),
});

// queries/todos.ts
export const todos = createQueryKeys('todos', {
  detail: (todoId: string) => [todoId],
  list: (filters: TodoFilters) => ({
    queryKey: [{ filters }],
    queryFn: (ctx) => api.getTodos({ filters, page: ctx.pageParam }),
  }),
});

// queries/index.ts
export const queries = mergeQueryKeys(users, todos);
```

### Type safety and smart autocomplete
Typescript is a first class citizen of Query Key Factory, providing easy of use and autocomplete for all query keys available and their outputs. Don't remember if a key is serializable or the shape of a key? Just let your IDE show you all information you need.

#### Infer the type of the store's query keys
```ts
import { createQueryKeyStore, inferQueryKeyStore } from "@lukemorales/query-key-factory";

export const queries = createQueryKeyStore({
  /* ... */
});

export type QueryKeys = inferQueryKeyStore<typeof queries>;
```
```ts
// queries/index.ts
import { mergeQueryKeys, inferQueryKeyStore } from "@lukemorales/query-key-factory";

import { users } from './users';
import { todos } from './todos';

export const queries = mergeQueryKeys(users, todos);

export type QueryKeys = inferQueryKeyStore<typeof queries>;
```

#### Infer the type of a feature's query keys
```ts
import { createQueryKeys, inferQueryKeys } from "@lukemorales/query-key-factory";

export const todos = createQueryKeys('todos', {
  detail: (todoId: string) => [todoId],
  list: (filters: TodoFilters) => ({
    queryKey: [{ filters }],
    queryFn: (ctx) => api.getTodos({ filters, page: ctx.pageParam }),
  }),
});

export type TodosKeys = inferQueryKeys<typeof todos>;
```

#### Type your QueryFunctionContext with ease
Get accurate types of your query keys passed to the `queryFn` context:

```ts
import type { QueryKeys } from "../queries";
// import type { TodosKeys } from "../queries/todos";

type TodosList = QueryKeys['todos']['list'];
// type TodosList = TodosKeys['list'];

const fetchTodos = async (ctx: QueryFunctionContext<TodosList['queryKey']>) => {
  const [, , { filters }] = ctx.queryKey;

  return api.getTodos({ filters, page: ctx.pageParam });
}

export function useTodos(filters: TodoFilters) {
  return useQuery({
    ...queries.todos.list(filters),
    queryFn: fetchTodos,
  });
};
```
