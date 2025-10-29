import { signal, WritableSignal, computed, Signal } from '@angular/core';

/**
 * Type representing a reactive object where each property becomes a signal
 */
export type ReactiveObject<T extends Record<string, unknown>> = {
  [K in keyof T]: WritableSignal<T[K]>;
} & {
  /** Get the current state as a plain object */
  readonly state: Signal<T>;
  /** Update multiple properties at once */
  readonly update: (partial: Partial<T>) => void;
  /** Reset all properties to their initial values */
  readonly reset: () => void;
};

/**
 * Creates a reactive object where each property becomes an individual signal.
 * This provides fine-grained reactivity where you can observe and update
 * individual properties without affecting others.
 *
 * @param initialValue - The initial object to make reactive
 * @returns A reactive object with signal properties and utility methods
 *
 * @example
 * ```ts
 * interface User {
 *   name: string;
 *   age: number;
 *   email: string;
 * }
 *
 * const user = reactive<User>({
 *   name: 'John',
 *   age: 30,
 *   email: 'john@example.com'
 * });
 *
 * // Access individual signals
 * console.log(user.name()); // 'John'
 * console.log(user.age()); // 30
 *
 * // Update individual properties
 * user.name.set('Jane');
 * user.age.update(age => age + 1);
 *
 * // Get the complete state
 * console.log(user.state()); // { name: 'Jane', age: 31, email: 'john@example.com' }
 *
 * // Update multiple properties
 * user.update({ name: 'Bob', email: 'bob@example.com' });
 *
 * // Reset to initial values
 * user.reset();
 * ```
 *
 * @example
 * ```ts
 * // Simple counter with multiple properties
 * const counter = reactive({
 *   count: 0,
 *   step: 1,
 *   label: 'Counter'
 * });
 *
 * // Create computed values based on individual signals
 * const doubleCount = computed(() => counter.count() * 2);
 * const displayText = computed(() => `${counter.label()}: ${counter.count()}`);
 *
 * // Update individual properties
 * counter.count.update(c => c + counter.step());
 * counter.step.set(5);
 * counter.label.set('Advanced Counter');
 * ```
 */
export function reactive<T extends Record<string, unknown>>(
  initialValue: T
): ReactiveObject<T> {
  // Store the initial value for reset functionality
  const initial = { ...initialValue };

  // Create individual signals for each property
  const signals = {} as { [K in keyof T]: WritableSignal<T[K]> };

  // Initialize signals for each property
  for (const key in initialValue) {
    if (Object.prototype.hasOwnProperty.call(initialValue, key)) {
      signals[key] = signal(initialValue[key]);
    }
  }

  // Create a computed signal that returns the current state
  const state = computed(() => {
    const result = {} as T;
    for (const key in signals) {
      if (Object.prototype.hasOwnProperty.call(signals, key)) {
        result[key] = signals[key]();
      }
    }
    return result;
  });

  // Update function to set multiple properties at once
  const update = (partial: Partial<T>) => {
    for (const key in partial) {
      if (
        Object.prototype.hasOwnProperty.call(partial, key) &&
        Object.prototype.hasOwnProperty.call(signals, key)
      ) {
        const value = partial[key];
        if (value !== undefined) {
          signals[key].set(value);
        }
      }
    }
  };

  // Reset function to restore initial values
  const reset = () => {
    for (const key in signals) {
      if (
        Object.prototype.hasOwnProperty.call(signals, key) &&
        Object.prototype.hasOwnProperty.call(initial, key)
      ) {
        signals[key].set(initial[key]);
      }
    }
  };

  // Create the reactive object with all signals and utility methods
  const reactiveObject = {
    ...signals,
    state,
    update,
    reset,
  } as ReactiveObject<T>;

  return reactiveObject;
}
