import { effect, signal, Signal, WritableSignal } from '@angular/core';

/**
 * Creates a signal that tracks the previous value of another signal.
 *
 * @param source - The signal to track
 * @returns A signal containing the previous value (undefined on first read)
 *
 * @example
 * ```ts
 * const count = signal(0);
 * const prevCount = usePrevious(count);
 *
 * console.log(prevCount()); // undefined
 * count.set(1);
 * console.log(prevCount()); // 0
 * count.set(2);
 * console.log(prevCount()); // 1
 * ```
 */
export function usePrevious<T>(source: Signal<T>): Signal<T | undefined> {
  const previous: WritableSignal<T | undefined> = signal(undefined);
  let lastValue: T | undefined = undefined;
  let isFirst = true;

  effect(() => {
    const current = source();

    if (!isFirst) {
      previous.set(lastValue);
    }

    lastValue = current;
    isFirst = false;
  });

  return previous.asReadonly();
}
