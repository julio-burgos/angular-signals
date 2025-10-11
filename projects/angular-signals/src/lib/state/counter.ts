import { signal, Signal, WritableSignal } from '@angular/core';

/**
 * Return type for the useCounter function.
 */
export interface CounterReturn {
  /** The current count value */
  count: Signal<number>;
  /** Increment the counter by step (default: 1) */
  increment: (step?: number) => void;
  /** Decrement the counter by step (default: 1) */
  decrement: (step?: number) => void;
  /** Reset the counter to initial or specified value */
  reset: (value?: number) => void;
  /** Set the counter to a specific value */
  set: (value: number) => void;
}

/**
 * Creates a counter signal with increment/decrement methods and optional bounds.
 *
 * @param initial - Initial count value (default: 0)
 * @param min - Minimum allowed value (default: -Infinity)
 * @param max - Maximum allowed value (default: Infinity)
 * @returns Object with count signal and manipulation methods
 *
 * @example
 * ```ts
 * const counter = useCounter(0, 0, 10);
 *
 * console.log(counter.count()); // 0
 * counter.increment();
 * console.log(counter.count()); // 1
 * counter.increment(5);
 * console.log(counter.count()); // 6
 * counter.increment(10);
 * console.log(counter.count()); // 10 (clamped to max)
 * counter.reset();
 * console.log(counter.count()); // 0
 * ```
 */
export function useCounter(
  initial = 0,
  min = -Infinity,
  max = Infinity
): CounterReturn {
  const initialValue = Math.max(min, Math.min(max, initial));
  const count: WritableSignal<number> = signal(initialValue);

  const clamp = (value: number): number => {
    return Math.max(min, Math.min(max, value));
  };

  return {
    count: count.asReadonly(),
    increment: (step = 1) => count.update(v => clamp(v + step)),
    decrement: (step = 1) => count.update(v => clamp(v - step)),
    reset: (value?: number) => count.set(clamp(value ?? initialValue)),
    set: (value: number) => count.set(clamp(value)),
  };
}
