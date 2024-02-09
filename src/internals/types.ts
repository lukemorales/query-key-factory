/**
 * @internal
 */
export type InternalKey = `_${string}`;

/**
 * @internal
 */
export type ExtractInternalKeys<T extends Record<string, unknown>> = Extract<keyof T, InternalKey>;
