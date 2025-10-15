import { effect, signal, Signal, WritableSignal } from '@angular/core';

/**
 * Configuration options for useNow.
 */
export interface NowOptions {
  /** Update interval in milliseconds (default: 1000) */
  interval?: number;
}

/**
 * Creates a signal that contains the current Date, updating at a specified interval.
 *
 * @param options - Configuration options
 * @returns A signal containing the current Date
 *
 * @example
 * ```ts
 * const now = useNow({ interval: 1000 });
 *
 * effect(() => {
 *   console.log('Current time:', now().toLocaleTimeString());
 * });
 * ```
 */
export function useNow(options: NowOptions = {}): Signal<Date> {
  const { interval = 1000 } = options;
  const now: WritableSignal<Date> = signal(new Date());

  effect(() => {
    const intervalId = setInterval(() => {
      now.set(new Date());
    }, interval);

    return () => {
      clearInterval(intervalId);
    };
  });

  return now.asReadonly();
}
