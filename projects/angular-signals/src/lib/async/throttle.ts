import { effect, signal, Signal, WritableSignal } from '@angular/core';

/**
 * Configuration options for throttling.
 */
export interface ThrottleOptions {
  /** Delay in milliseconds */
  delay: number;
  /** Execute on the leading edge (default: true) */
  leading?: boolean;
  /** Execute on the trailing edge (default: false) */
  trailing?: boolean;
}

/**
 * Creates a throttled version of a signal that limits update frequency.
 *
 * @param source - The signal to throttle
 * @param options - Throttle configuration
 * @returns A throttled signal
 *
 * @example
 * ```ts
 * const scrollY = signal(0);
 * const throttledScrollY = useThrottle(scrollY, { delay: 100 });
 *
 * // scrollY updates frequently, but throttledScrollY updates at most once per 100ms
 * ```
 */
export function useThrottle<T>(
  source: Signal<T>,
  options: ThrottleOptions
): Signal<T> {
  const { delay, leading = true, trailing = false } = options;
  const throttled: WritableSignal<T> = signal(source());

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastExecuted = 0;
  let isFirstRun = true;

  effect(() => {
    const value = source();

    // Skip the initial effect run
    if (isFirstRun) {
      isFirstRun = false;
      return;
    }

    const execute = () => {
      throttled.set(value);
      lastExecuted = Date.now();
    };

    const timeSinceLastExecute = Date.now() - lastExecuted;

    if (leading && timeSinceLastExecute >= delay) {
      execute();
    } else if (trailing) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(execute, delay - timeSinceLastExecute);
    }
  });

  return throttled.asReadonly();
}
