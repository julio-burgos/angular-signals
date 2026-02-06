import {
  CreateEffectOptions,
  effect,
  EffectRef,
  Signal,
  untracked,
} from '@angular/core';
import { withCleanupRegistrar } from '../utils/on-cleanup';

export interface WatchOptions {
  /**
   * Run the callback immediately on setup (default: true).
   */
  immediate?: boolean;
}

/**
 * Watch one or more signals and run a callback when they change.
 *
 * @param deps - Signals to watch
 * @param callback - Callback invoked when any dependency changes
 * @param options - Optional effect configuration
 */
export function watch(
  deps: readonly Signal<any>[],
  callback: () => void,
  options?: CreateEffectOptions & WatchOptions
): EffectRef;

/**
 * Watch a single signal (or getter) and receive current/previous values.
 */
export function watch<T>(
  dep: Signal<T> | (() => T),
  callback: (value: T, previous: T | undefined) => void,
  options?: CreateEffectOptions & WatchOptions
): EffectRef;

export function watch<T>(
  deps: readonly Signal<any>[] | Signal<T> | (() => T),
  callback: (() => void) | ((value: T, previous: T | undefined) => void),
  options: (CreateEffectOptions & WatchOptions) = {}
): EffectRef {
  const { immediate = true, ...effectOptions } = options;

  const isArray = Array.isArray(deps);
  const getValue = isArray
    ? null
    : (deps as Signal<T> | (() => T));

  let previous: T | undefined = undefined;
  let isFirst = true;

  return effect((registerCleanup) => {
    if (isArray) {
      (deps as readonly Signal<any>[]).forEach((s) => s());
      if (!immediate && isFirst) {
        isFirst = false;
        return;
      }

      return withCleanupRegistrar(registerCleanup, () =>
        untracked(() => (callback as () => void)())
      );
    }

    const value = (getValue as any)();
    if (!immediate && isFirst) {
      previous = value;
      isFirst = false;
      return;
    }

    const prev = previous;
    previous = value;
    isFirst = false;

    return withCleanupRegistrar(registerCleanup, () =>
      untracked(() => (callback as any)(value, prev))
    );
  }, effectOptions);
}
