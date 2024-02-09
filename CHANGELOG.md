# @lukemorales/query-key-factory

## 1.3.3

### Patch Changes

- [`9b5401c`](https://github.com/lukemorales/query-key-factory/commit/9b5401cdd8ff6b3a85074285ab7ed68a6ab3a252) Thanks [@lukemorales](https://github.com/lukemorales)! - Improve `mergeQueryKeys` type inference and improve type-safety for dynamic query keys

## 1.3.2

### Patch Changes

- [#70](https://github.com/lukemorales/query-key-factory/pull/70) [`1a9f74d`](https://github.com/lukemorales/query-key-factory/commit/1a9f74d413abaec74914de0bde8d1dfa6a1ac3d5) Thanks [@lukemorales](https://github.com/lukemorales)! - Fix type inference allowing extra keys

## 1.3.1

### Patch Changes

- [#67](https://github.com/lukemorales/query-key-factory/pull/67) [`e6b8389`](https://github.com/lukemorales/query-key-factory/commit/e6b8389742229bda5b28c233212bc7a87513b52e) Thanks [@lukemorales](https://github.com/lukemorales)! - Loosen types for `TypedUseQueryOptions` and allow inference of dynamic query options generation

## 1.3.0

### Minor Changes

- [#65](https://github.com/lukemorales/query-key-factory/pull/65) [`1cf53a1`](https://github.com/lukemorales/query-key-factory/commit/1cf53a1b2e2e81ab0f38834183ca076939878505) Thanks [@lukemorales](https://github.com/lukemorales)! - Refactor codebase and expose new `TypedUseQueryOptions` type

## 1.2.0

### Minor Changes

- [#51](https://github.com/lukemorales/query-key-factory/pull/51) [`142024d`](https://github.com/lukemorales/query-key-factory/commit/142024d484141904bac0b80b0a45576f1be24a98) Thanks [@s-bondarenko](https://github.com/s-bondarenko)! - Implemented `create-mutation-keys` function for creating of mutation keys

### Patch Changes

- [#51](https://github.com/lukemorales/query-key-factory/pull/51) [`142024d`](https://github.com/lukemorales/query-key-factory/commit/142024d484141904bac0b80b0a45576f1be24a98) Thanks [@s-bondarenko](https://github.com/s-bondarenko)! - Added possibility to merge mutation keys with query keys

## 1.1.0

### Minor Changes

- [#47](https://github.com/lukemorales/query-key-factory/pull/47) [`7013e19`](https://github.com/lukemorales/query-key-factory/commit/7013e197051f105dcbe585a276b93306ce069735) Thanks [@lukemorales](https://github.com/lukemorales)! - Add support for longer query keys in the `QueryOptions` pattern

- [#34](https://github.com/lukemorales/query-key-factory/pull/34) [`abb3596`](https://github.com/lukemorales/query-key-factory/commit/abb35962028285d8a71ad10113e7dd5a576ccfba) Thanks [@wconnorwalsh](https://github.com/wconnorwalsh)! - Replace internal types with official `@tanstack/query-core` types

### Patch Changes

- [#46](https://github.com/lukemorales/query-key-factory/pull/46) [`0518ac4`](https://github.com/lukemorales/query-key-factory/commit/0518ac40b5f3eab802560fbe1183be9428cb18d6) Thanks [@lukemorales](https://github.com/lukemorales)! - Fix conflicting types

## 1.0.2

### Patch Changes

- [#32](https://github.com/lukemorales/query-key-factory/pull/32) [`f74ec8e`](https://github.com/lukemorales/query-key-factory/commit/f74ec8ed8306650fb6d9296d5982605cfce7534c) Thanks [@lukemorales](https://github.com/lukemorales)! - Fix published types

## 1.0.1

### Patch Changes

- [`d8bdb58`](https://github.com/lukemorales/query-key-factory/commit/d8bdb581c551d53a7fb8cf774c5e2b15554d25ee) Thanks [@lukemorales](https://github.com/lukemorales)! - Fix wrong published types for contextual queries

## 1.0.0

### Major Changes

- [#20](https://github.com/lukemorales/query-key-factory/pull/20) [`ba47907`](https://github.com/lukemorales/query-key-factory/commit/ba479075bc22741486d45b35a654e24c06baf4d7) Thanks [@lukemorales](https://github.com/lukemorales)! - ## Generate query options and add support for nested keys

  New in `@lukemorales/query-key-factory` is support for nested keys and generation of query options, adopting the query options overload as first class citizen, in preparation for [React Query v5 roadmap](https://github.com/TanStack/query/discussions/4252).

  ```ts
  const people = createQueryKeys("people", {
    person: (id: number) => ({
      queryKey: [id],
      queryFn: () => api.getPerson({ params: { id } }),
      contextQueries: {
        ships: {
          queryKey: null,
          queryFn: () =>
            api.getShipsByPerson({
              params: { personId: id },
            }),
        },
        film: (filmId: string) => ({
          queryKey: [filmId],
          queryFn: () =>
            api.getFilm({
              params: { id: filmId },
            }),
        }),
      },
    }),
  });
  ```

  Each entry outputs an object that can be used in the query options overload in React Query:

  ```tsx
  console.log(people.person("person_01"));

  // => output:
  // {
  //   queryKey: ['people', 'person', 'person_01'],
  //   queryFn: () => api.getPerson({ params: { id: 'person_01' } }),
  //   _ctx: { ...queries declared inside "contextQueries" }
  // }
  ```

  Then you can easily just use the object in `useQuery` or spread it and add more query options to that observer:

  ```tsx
  export const Person = ({ id }) => {
    const personQuery = useQuery(people.person(id));

    return {
      /* render person data */
    };
  };

  export const Ships = ({ personId }) => {
    const shipsQuery = useQuery({
      ...people.person(personId)._ctx.ships,
      enabled: !!personId,
    });

    return {
      /* render ships data */
    };
  };

  export const Film = ({ id, personId }) => {
    const filmQuery = useQuery(people.person(personId)._ctx.film(id));

    return {
      /* render film data */
    };
  };
  ```

  ### BREAKING CHANGES

  #### Standardized query key values

  All query key values should now be an array. Only the first level keys (those not dynamically generated) can still be declared as `null`, but if you want to pass a value, you will need to make it an array.

  ```diff
  export const todosKeys = createQueryKeys('todos', {
    mine: null,
  - all: 'all-todos',
  + all: ['all-todos'],
  - list: (filters: TodoFilters) => ({ filters }),
  + list: (filters: TodoFilters) => [{ filters }],
  - todo: (todoId: string) => todoId,
  + todo: (todoId: string) => [todoId],
  });
  ```

  #### Objects are now used to declare query options

  You can still use objects to compose a query key, but now they must be inside an array because plain objects are now used for the declaration of the query options:

  ```diff
  export const todosKeys = createQueryKeys('todos', {
  - list: (filters: TodoFilters) => ({ filters }),
  + list: (filters: TodoFilters) => ({
  +   queryKey: [{ filters }],
  + }),
  });
  ```

  #### Generated output for a query key is always an object

  With the new API, the output of an entry will always be an object according to what options you've declared in the factory (e.g.: if you returned an array or declared an object with only `queryKey`, your output will be `{ queryKey: [...values] }`, if you also declared `queryFn` it will be added to that object, and `contextQueries` will be available inside `_ctx`):

  ```diff
  export const todosKeys = createQueryKeys('todos', {
    todo: (todoId: string) => [todoId],
    list: (filters: TodoFilters) => {
      queryKey: [{ filters }],
      queryFn: () => fetchTodosList(filters),
    },
  });

  - useQuery(todosKeys.todo(todoId), fetchTodo);
  + useQuery(todosKeys.todo(todoId).queryKey, fetchTodo);

  - useQuery(todosKeys.list(filters), fetchTodosList);
  + useQuery(todosKeys.list(filters).queryKey, todosKeys.list(filters).queryFn);

  // even better refactor, preparing for React Query v5
  + useQuery({
  +   ...todosKeys.todo(todoId),
  +   queryFn: fetchTodo,
  + });

  + useQuery(todosKeys.list(filters));
  ```

  #### Helper types to infer query keys in the store reflect the new output

  The helper types to infer query keys in the created store reflect the new output, to account for all possible use cases:

  ```diff
  type TodosKeys = inferQueryKeys<typeof todosKeys>;

  - type SingleTodoQueryKey = TodosKeys['todo'];
  + type SingleTodoQueryKey = TodosKeys['todo']['queryKey'];
  ```

- [#20](https://github.com/lukemorales/query-key-factory/pull/20) [`ba47907`](https://github.com/lukemorales/query-key-factory/commit/ba479075bc22741486d45b35a654e24c06baf4d7) Thanks [@lukemorales](https://github.com/lukemorales)! - ## Remove deprecated methods
  Since `v0.6.0`, the `default` key and and `toScope` method have been deprecated from the package.

  ### BREAKING CHANGES

  ### `default` and `toScope` removed from implementation

  `default` key and `toScope` method have been officially removed from the code, which means that if you try to access them, you will either receive `undefined` or your code will throw for trying to invoke a function on `toScope` that does not exist anymore.

## 0.6.1

### Patch Changes

- Fix query key breaking devtools because of Proxy

## 0.6.0

### Minor Changes

- Introduce internal `_def` key and deprecate `default` and `toScope`

## 0.5.0

### Minor Changes

- Create `createQueryKeyStore` to allow declaring all feature keys in one place

## 0.4.0

### Minor Changes

- Create `mergeQueryKeys` to create single access point to all query keys

## 0.3.2

### Patch Changes

- Add `inferQueryKeys` type to create interface from result of `createQueryKeys`

## 0.3.1

### Patch Changes

- Fix new types not published

## 0.3.0

### Minor Changes

- Allow tuples of any size in dynamic keys

## 0.2.1

### Patch Changes

- Removes yarn engine restriction

## 0.2.0

### Minor Changes

- Make serializable keys less strict
