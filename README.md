<p align="center">
  <a href="https://github.com/lukemorales/query-key-factory"><img src="https://images.emojiterra.com/mozilla/512px/1f3ed.png" alt="Factory emoji" height="130"/ target="\_parent"></a>
</p>

<h1 align="center">Query Key Factory</h1>

<p align="center">
  <a href="https://github.com/lukemorales/query-key-factory/actions/workflows/tests.yml"><img src="https://github.com/lukemorales/query-key-factory/actions/workflows/tests.yml/badge.svg?branch=main" alt="Latest build" target="\_parent"></a>
  <a href="https://www.npmjs.com/package/@lukemorales/query-key-factory"><img src="https://badgen.net/npm/v/@lukemorales/query-key-factory" alt="Latest published version" target="\_parent"></a>
  <a href="https://bundlephobia.com/package/@lukemorales/query-key-factory@latest"><img src="https://badgen.net/bundlephobia/minzip/@lukemorales/query-key-factory" alt="Bundlephobia" target="\_parent"></a>
  <a href="https://bundlephobia.com/package/@lukemorales/query-key-factory@latest"><img src="https://badgen.net/bundlephobia/tree-shaking/@lukemorales/query-key-factory" alt="Tree shaking available" target="\_parent"></a>
  <a href="https://github.com/lukemorales/query-key-factory"><img src="https://badgen.net/npm/types/@lukemorales/query-key-factory" alt="Types included" target="\_parent"></a>
  <a href="https://www.npmjs.com/package/@lukemorales/query-key-factory"><img src="https://badgen.net/npm/license/@lukemorales/query-key-factory" alt="License" target="\_parent"></a>
  <a href="https://www.npmjs.com/package/@lukemorales/query-key-factory"><img src="https://badgen.net/npm/dt/@lukemorales/query-key-factory" alt="Number of downloads" target="\_parent"></a>
  <a href="https://github.com/lukemorales/query-key-factory"><img src="https://img.shields.io/github/stars/lukemorales/query-key-factory.svg?style=social&amp;label=Star" alt="GitHub Stars" target="\_parent"></a>
</p>

<p align="center">
  <strong>Typesafe query key management for <a href="https://tanstack.com/query" alt="Tanstack Query" target="\_parent">@tanstack/query</a> with auto-completion features.</strong>
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

// if your prefer to declare everything in one file
export const queryKeys = createQueryKeyStore({
  users: null,
  todos: {
    list: (filters: TodoFilters) => ({ filters }),
    search: (query: string, limit = 15) => [query, limit],
    todo: (todoId: string) => todoId,
  },
});
```

### Fine-grained declaration colocated by features
```ts
import { createQueryKeys, mergeQueryKeys } from "@lukemorales/query-key-factory";

// queries/users.ts
export const usersKeys = createQueryKeys('users');

// queries/todos.ts
export const todosKeys = createQueryKeys('todos', {
  list: (filters: TodoFilters) => ({ filters }),
  search: (query: string, limit = 15) => [query, limit],
  todo: (todoId: string) => todoId,
});

// queries/index.ts
export const queryKeys = mergeQueryKeys(usersKeys, todosKeys);
```

Use throughout your codebase as the single source for writing the query keys for your cache management:

```ts
import { queryKeys } from '../queries';

export function useUsers() {
  return useQuery(queryKeys.users._def, fetchUsers);
};
```

```ts
import { queryKeys } from '../queries';

export function useTodos(filters: TodoFilters) {
  return useQuery(queryKeys.todos.list(filters), fetchTodos);
};

export function useSearchTodos(query: string, limit = 15) {
  return useQuery(queryKeys.todos.search(query, limit), fetchSearchTodos, {
    enabled: Boolean(query),
  });
};

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation(updateTodo, {
    onSuccess(newTodo) {
      queryClient.setQueryData(queryKeys.todos.todo(newTodo.id), newTodo);

      // invalidate all the list queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.todos.list._def,
        refetchActive: false,
      });
    },
  });
};
```
<br />

## 📝 Features
### Standardized keys
All keys generated follow the @tanstack/query standard of being an [array at top level](https://tanstack.com/query/v4/docs/guides/query-keys), including [keys with serializable objects](https://tanstack.com/query/v4/docs/guides/query-keys#array-keys-with-variables):

```ts
export const todosKeys = createQueryKeys('todos', {
  list: (filters: TodoFilters) => ({ filters }),
  search: (query: string, limit = 15) => [query, limit],
  todo: (todoId: string) => todoId,
});

// => createQueryKeys output:
// {
//   _def: ['todos'],
//   list: (filters: TodoFilters) => ['todos', 'list', { filters }],
//   search: (query: string, limit = 15) => ['todos', 'search', query, limit],
//   todo: (todoId: string) => ['todos', 'todo', todoId],
// }
```

### Access to serializable keys scope definition
Easy way to access the serializable key scope and invalidate all cache for that context:
```ts
todosKeys.list({ status: 'completed' }) // => ['todos', 'list', { status: 'completed' }]
todosKeys.list._def; // => ['todos', 'list']

todosKeys.search('tanstack query', 15); // => ['todos', 'search', 'tanstack query', 15]
todosKeys.search._def; // => ['todos', 'search']

todosKeys.todo('todo-id'); // => ['todos', 'todo', 'todo-id']
todosKeys.todo._def; // => ['todos', 'todo']
```

### Create a single point of access for all your query keys

#### Declare your query keys store in a single file
Just one place to edit and maintain your store:
```ts
export const queryKeys = createQueryKeyStore({
  users: null,
  todos: {
    list: (filters: TodoFilters) => ({ filters }),
    search: (query: string, limit = 15) => [query, limit],
    todo: (todoId: string) => todoId,
  },
});

// => createQueryKeyStore output:
// {
//   users: {
//     _def: ['users'],
//   },
//   todos: {
//     _def: ['todos'],
//     list: (filters: TodoFilters) => ['todos', 'list', { filters }],
//     search: (query: string, limit = 15) => ['todos', 'search', query, limit],
//     todo: (todoId: string) => ['todos', 'todo', todoId],
//   },
// };
```

#### Declare your query keys by feature
Have fine-grained control over your features' keys and merge them into a single object to have access to all your query keys in your codebase:

```ts
// queries/users.ts
const usersKeys = createQueryKeys('users');

// queries/todos.ts
const todosKeys = createQueryKeys('todos', {
  list: (filters: TodoFilters) => ({ filters }),
  search: (query: string, limit = 15) => [query, limit],
  todo: (todoId: string) => todoId,
});

// queries/index.ts
export const queryKeys = mergeQueryKeys(usersKeys, todosKeys);

// => mergeQueryKeys output:
// {
//   users: {
//     _def: ['users'],
//   },
//   todos: {
//     _def: ['todos'],
//     list: (filters: TodoFilters) => ['todos', 'list', { filters }],
//     search: (query: string, limit = 15) => ['todos', 'search', query, limit],
//     todo: (todoId: string) => ['todos', 'todo', todoId],
//   },
// };
```

### Type safety and smart autocomplete
Typescript is a first class citizen of the Query Key Factory lib, providing easy of use and autocomplete for all query keys available and their outputs. Don't remember if a key is serializable or the shape of a key? Just mouseover and your IDE will show you all information you need to know.

#### Infer the type of the store's query keys
```ts
import { createQueryKeyStore, inferQueryKeyStore } from "@lukemorales/query-key-factory";

export const queryKeys = createQueryKeyStore({
  users: null,
  todos: {
    list: (filters: TodoFilters) => ({ filters }),
    search: (query: string, limit = 15) => [query, limit],
    todo: (todoId: string) => todoId,
  },
});

export type QueryKeys = inferQueryKeyStore<typeof queryKeys>;

// => QueryKeys type:
// {
//   users: {
//     _def: readonly ['users'];
//   };
//   todos: {
//     _def: readonly ['todos'];
//     list: readonly ['todos', 'list', { filters: TodoFilters }];
//     search: readonly ['todos', 'search', string, number];
//     todo: readonly ['todos', 'todo', string];
//   };
// }
```
```ts
import { createQueryKeys, inferQueryKeyStore } from "@lukemorales/query-key-factory";

// queries/users.ts
const usersKeys = createQueryKeys('users');

// queries/todos.ts
const todosKeys = createQueryKeys('todos', {
  list: (filters: TodoFilters) => ({ filters }),
  search: (query: string, limit = 15) => [query, limit],
  todo: (todoId: string) => todoId,
});

// queries/index.ts
export const queryKeys = mergeQueryKeys(usersKeys, todosKeys);

export type QueryKeys = inferQueryKeyStore<typeof queryKeys>;
```

#### Infer the type of a feature's query keys
```ts
import { createQueryKeys, inferQueryKeys } from "@lukemorales/query-key-factory";

export const todosKeys = createQueryKeys('todos', {
  list: (filters: TodoFilters) => ({ filters }),
  search: (query: string, limit = 15) => [query, limit],
  todo: (todoId: string) => todoId,
});

export type TodosKeys = inferQueryKeys<typeof todosKeys>;
```

#### Type your QueryFunctionContext with ease
Get accurate types of your query keys passed to the `queryFn` context:

```ts
import type { QueryKeys } from "../queries";
import type { TodosKeys } from "../queries/todos";

type TodosListQueryKey = QueryKeys['todos']['list'] | TodosKeys['list'];

const fetchTodos = async (ctx: QueryFunctionContext<TodosListQueryKey>) => {
  const [, , { filters }] = ctx.queryKey; // readonly ['todos', 'list', { filters }]

  const search = new URLSearchParams(filters);

  return fetch(`${BASE_URL}/todos?${search.toString()}`).then(data => data.json());
}

export function useTodos(filters: TodoFilters) {
  return useQuery(queryKeys.todos.list(filters), fetchTodos);
};
```
