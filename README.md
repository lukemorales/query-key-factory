<p align="center">
  <a href="https://github.com/lukemorales/query-key-factory"><img src="https://images.emojiterra.com/mozilla/512px/1f3ed.png" alt="tRPC" height="130"/ target="\_parent"></a>
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
```ts
import { createQueryKeys } from "@lukemorales/query-key-factory"

export const usersKeys = createQueryKeys('users');

export const productsKeys = createQueryKeys('products', {
  bestSelling: null,
  search: (query: string, limit = 15) => ({ query, limit }),
  byId: (productId: string) => ({ productId }),
});
```
Use throughout your codebase as the single source for writing the query keys for your cache management:
```tsx
import { usersKeys, productsKeys } from '../query-keys';

const UserList: FC = () => {
  const users = useQuery(usersKeys.default, fetchUsers);

  return <div> {/* render product page */} </div>;
};

const ProductList: FC = () => {
  const [search, setSeach] = useState('');
  const [productsPerPage, setProductsPerPage] = useState(15);

  const products = useQuery(productsKeys.search(search, productsPerPage), fetchProducts);

  useEffect(() => {
    if (search === '') {
      // invalidate cache only for the search scope
      queryClient.invalidateQueries(productKeys.search.toScope());
    }
  }, [search]);

  return <div> {/* render product list */} </div>;
};

const Product: FC = () => {
  const { productId } = useParams();
  const product = useQuery(productsKeys.byId(productId), fetchProduct);

  const onAddToCart = () => {
    // invalidade cache for entire feature
    queryClient.invalidateQueries(productsKeys.default);
  }

  return <div> {/* render product page */} </div>;
}
```

## 📝 Features
### Typesafe and autocomplete
Typescript is a first class citizen of the Query Key Factory lib, providing easy of use and autocomplete for all query keys available and their outputs. Don't remember if a key is serializable or the shape of a key? Just mouseover and your IDE will show you all information you need to know.

### Standardized keys
All keys generated follow the @tanstack/query recommendation of being an [array at top level](https://tanstack.com/query/v4/docs/guides/query-keys), including [keys with serializable objects](https://tanstack.com/query/v4/docs/guides/query-keys#array-keys-with-variables):

```ts
const todosKeys = createQueryKeys('todos', {
  done: null,
  preview: true,
  single: (id: string) => id,
});

// shape of createQueryKeys output
todosKeys = {
  default: ['todos'],
  done: ['todos', 'done'],
  preview: ['todos', 'preview', true],
  single: ('todo_id') => ['todos', 'single', 'todo_id'],
}
```

### Access to serializable keys scoped form
Easy way to access the serializable key scope and invalidade all cache for that context:
```ts
const todosKeys = createQueryKeys('todos', {
  single: (id: string) => id,
  tag: (tagId: string) => ({ tagId }),
  search: (query: string, limit: number) => [query, { limit }],
  filter: ({ filter, status, limit }: FilterOptions) => [filter, status, limit],
});


todosKeys.single('todo_id');
// ['todos', 'single', 'todo_id']
todosKeys.tag('tag_homework');
// ['todos', 'tag', { tagId: 'tag_homework' }]
todosKeys.search('learn tanstack query', 15);
// ['todos', 'search', 'learn tanstack query', { limit: 15 }]
todosKeys.filter('not-owned-by-me', 'done', 15);
// ['todos', 'filter', 'not-owned-by-me', 'done', 15]

todosKeys.single.toScope(); // ['todos', 'single']
todosKeys.tag.toScope(); // ['todos', 'tag']
todosKeys.search.toScope(); // ['todos', 'search']
```
