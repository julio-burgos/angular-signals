import { signal, Signal, WritableSignal } from '@angular/core';

/**
 * Return type for the useToggle function.
 */
export interface ToggleReturn {
  /** The current boolean value */
  value: Signal<boolean>;
  /** Toggle the value */
  toggle: () => void;
  /** Set value to true */
  setTrue: () => void;
  /** Set value to false */
  setFalse: () => void;
}

/**
 * Creates a boolean signal with convenient toggle methods.
 *
 * @param initial - Initial boolean value (default: false)
 * @returns Object with value signal and toggle methods
 *
 * @example
 * ```ts
 * const modal = useToggle(false);
 *
 * console.log(modal.value()); // false
 * modal.toggle();
 * console.log(modal.value()); // true
 * modal.setFalse();
 * console.log(modal.value()); // false
 * ```
 */
export function useToggle(initial = false): ToggleReturn {
  const value: WritableSignal<boolean> = signal(initial);

  return {
    value: value.asReadonly(),
    toggle: () => value.update(v => !v),
    setTrue: () => value.set(true),
    setFalse: () => value.set(false),
  };
}
