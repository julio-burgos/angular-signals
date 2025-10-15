import { signal, Signal, WritableSignal } from '@angular/core';

/**
 * Return type for the useArray function.
 */
export interface ArrayReturn<T> {
  /** The current array value */
  items: Signal<readonly T[]>;
  /** Add items to the end of the array */
  push: (...items: T[]) => void;
  /** Remove and return the last item */
  pop: () => T | undefined;
  /** Remove and return the first item */
  shift: () => T | undefined;
  /** Add items to the beginning of the array */
  unshift: (...items: T[]) => void;
  /** Filter items based on predicate */
  filter: (predicate: (item: T, index: number) => boolean) => void;
  /** Map items to new values */
  map: <U>(fn: (item: T, index: number) => U) => void;
  /** Remove all items */
  clear: () => void;
  /** Remove item at specific index */
  remove: (index: number) => void;
  /** Insert item at specific index */
  insert: (index: number, item: T) => void;
  /** Replace the entire array */
  set: (items: T[]) => void;
  /** Find first item matching predicate */
  find: (predicate: (item: T) => boolean) => T | undefined;
  /** Find index of first item matching predicate */
  findIndex: (predicate: (item: T) => boolean) => number;
}

/**
 * Creates an array signal with convenient manipulation methods.
 * All operations return new arrays (immutable).
 *
 * @param initial - Initial array value (default: [])
 * @returns Object with items signal and array manipulation methods
 *
 * @example
 * ```ts
 * const todos = useArray<string>(['Buy milk', 'Walk dog']);
 *
 * console.log(todos.items()); // ['Buy milk', 'Walk dog']
 * todos.push('Clean room');
 * console.log(todos.items()); // ['Buy milk', 'Walk dog', 'Clean room']
 * todos.remove(0);
 * console.log(todos.items()); // ['Walk dog', 'Clean room']
 * todos.clear();
 * console.log(todos.items()); // []
 * ```
 */
export function useArray<T>(initial: T[] = []): ArrayReturn<T> {
  const items: WritableSignal<readonly T[]> = signal([...initial]);

  return {
    items: items.asReadonly(),
    push: (...newItems: T[]) => items.update(arr => [...arr, ...newItems]),
    pop: () => {
      let popped: T | undefined;
      items.update(arr => {
        if (arr.length === 0) return arr;
        const newArr = [...arr];
        popped = newArr.pop();
        return newArr;
      });
      return popped;
    },
    shift: () => {
      let shifted: T | undefined;
      items.update(arr => {
        if (arr.length === 0) return arr;
        const newArr = [...arr];
        shifted = newArr.shift();
        return newArr;
      });
      return shifted;
    },
    unshift: (...newItems: T[]) => items.update(arr => [...newItems, ...arr]),
    filter: (predicate: (item: T, index: number) => boolean) =>
      items.update(arr => arr.filter(predicate)),
    map: <U>(fn: (item: T, index: number) => U) =>
      items.update(arr => arr.map(fn) as any),
    clear: () => items.set([]),
    remove: (index: number) =>
      items.update(arr => arr.filter((_, i) => i !== index)),
    insert: (index: number, item: T) =>
      items.update(arr => {
        const newArr = [...arr];
        newArr.splice(index, 0, item);
        return newArr;
      }),
    set: (newItems: T[]) => items.set([...newItems]),
    find: (predicate: (item: T) => boolean) => items().find(predicate),
    findIndex: (predicate: (item: T) => boolean) => items().findIndex(predicate),
  };
}
