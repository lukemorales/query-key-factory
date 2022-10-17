---
'@lukemorales/query-key-factory': major
---

## Remove deprecated methods
Since `v0.6.0`, the `default` key and and `toScope` method have been deprecated from the package.

### BREAKING CHANGES

### `default` and `toScope` removed from implementation
`default` key and `toScope` method have been officially removed from the code, which means that if you try to access them, you will either receive `undefined` or your code will throw for trying to invoke a function on `toScope` that does not exist anymore.
