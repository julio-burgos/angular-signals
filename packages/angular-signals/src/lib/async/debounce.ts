import { effect, signal, Signal, WritableSignal } from '@angular/core';

/**
 * Configuration options for debouncing.
 */
export interface DebounceOptions {
  /** Delay in milliseconds */
  delay: number;
  /** Execute on the leading edge (default: false) */
  leading?: boolean;
  /** Execute on the trailing edge (default: true) */
  trailing?: boolean;
}

/**
 * Creates a debounced version of a signal that delays updates.
 *
 * @param source - The signal to debounce
 * @param options - Debounce configuration
 * @returns A debounced signal
 *
 * @example
 * ```ts
 * const search = signal('');
 * const debouncedSearch = useDebounce(search, { delay: 300 });
 *
 * search.set('hello'); // debouncedSearch updates after 300ms
 * ```
 */
export function useDebounce<T>(
  source: Signal<T>,
  options: DebounceOptions
): Signal<T> {
  const { delay, leading = false, trailing = true } = options;
  const debounced: WritableSignal<T> = signal(source());

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastLeadingTime = 0;
  let isFirstRun = true;

  effect(() => {
    const value = source();

    // Skip the initial effect run
    if (isFirstRun) {
      isFirstRun = false;
      return;
    }

    // Clear any pending timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    // Leading edge execution
    const now = Date.now();
    if (leading && now - lastLeadingTime >= delay) {
      debounced.set(value);
      lastLeadingTime = now;
    }

    // Trailing edge execution
    if (trailing) {
      timeoutId = setTimeout(() => {
        debounced.set(value);
        timeoutId = null;
      }, delay);
    }
  });

  return debounced.asReadonly();
}
