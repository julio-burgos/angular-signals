import { effect, signal, Signal, WritableSignal, isSignal } from '@angular/core';

/**
 * Creates a signal that tracks whether a media query matches.
 *
 * @param query - CSS media query string or signal of query
 * @returns A signal indicating if the media query matches
 *
 * @example
 * ```ts
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isDark = useMediaQuery('(prefers-color-scheme: dark)');
 *
 * effect(() => {
 *   console.log('Is mobile:', isMobile());
 *   console.log('Dark mode:', isDark());
 * });
 * ```
 */
export function useMediaQuery(query: string | Signal<string>): Signal<boolean> {
  const matches: WritableSignal<boolean> = signal(false);

  effect(() => {
    if (typeof window === 'undefined') return;

    const currentQuery = isSignal(query) ? query() : query;
    const mediaQuery = window.matchMedia(currentQuery);

    matches.set(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      matches.set(event.matches);
    };

    mediaQuery.addEventListener('change', handler);

    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  });

  return matches.asReadonly();
}
