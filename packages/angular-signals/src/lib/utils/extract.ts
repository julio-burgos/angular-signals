/**
 * A value that can be provided directly or via a getter function (including Angular Signals).
 */
export type MaybeGetter<T> = T | (() => T);

/**
 * Extracts a value from a direct value or getter (including Angular Signals).
 *
 * Note: If you pass a plain function that isn't an Angular Signal, it will still be called.
 *
 * @param value - A value or a getter function returning the value
 * @returns The resolved value
 *
 * @example
 * ```ts
 * const n = extract(1); // 1
 * const s = signal(2);
 * const v = extract(s); // 2
 * ```
 */
export function extract<T>(value: MaybeGetter<T>): T {
  return typeof value === 'function' ? (value as () => T)() : value;
}

