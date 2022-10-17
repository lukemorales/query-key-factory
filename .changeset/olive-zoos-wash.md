---
'@lukemorales/query-key-factory': major
---

## Generate query options and add support for nested keys

New in `@lukemorales/query-key-factory` is support for nested keys and generation of query options, adopting the query options overload as first class citizen, in preparation for [React Query v5 roadmap](https://github.com/TanStack/query/discussions/4252).

```ts
const people = createQueryKeys("people", {
  person: (id: number) => ({
    queryKey: [id],
    queryFn: () => api.getPerson({ params: { id } }),
    contextQueries: {
      ships: {
        queryKey: null,
        queryFn: () => api.getShipsByPerson({
          params: { personId: id },
        }),
      },
      film: (filmId: string) => ({
        queryKey: [filmId],
        queryFn: () => api.getFilm({
          params: { id: filmId },
        }),
      }),
    },
  }),
});
```

Each entry outputs an object that can be used in the query options overload in React Query:
```tsx
console.log(people.person('person_01'));

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

  return  ( {/* render person data */} );
};

export const Ships = ({ personId }) => {
  const shipsQuery = useQuery({
    ...people.person(personId)._ctx.ships,
    enabled: !!personId,
  });

  return ( {/* render ships data */} );
};

export const Film = ({ id, personId }) => {
  const filmQuery = useQuery(people.person(personId)._ctx.film(id));

  return ( {/* render film data */} );
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
