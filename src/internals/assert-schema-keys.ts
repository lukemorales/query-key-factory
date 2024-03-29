/**
 * @internal ensures no keys provided by the user starts with an _underscore `_`_
 */
export const assertSchemaKeys = (schema: Record<string, unknown>): string[] => {
  const keys = Object.keys(schema).sort((a, b) => a.localeCompare(b));

  const hasKeyInShapeOfInternalKey = keys.some((key) => key.startsWith('_'));

  if (hasKeyInShapeOfInternalKey) {
    throw new Error('Keys that start with "_" are reserved for Query Key Factory');
  }

  return keys;
};
